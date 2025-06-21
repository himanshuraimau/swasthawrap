from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from bson import ObjectId # type: ignore
import logging
import os
import uuid
from fastapi import UploadFile # type: ignore

from models.health import (
    MedicalCondition, MedicalConditionCreate, MedicalConditionUpdate, MedicalConditionResponse,
    HealthMetric, HealthMetricCreate, HealthMetricResponse,
    HealthGoal, HealthGoalCreate, HealthGoalProgressUpdate, HealthGoalResponse,
    MedicalDocument, MedicalDocumentUpload, MedicalDocumentResponse,
    MetricType, DocumentCategory
)
from database import get_database

logger = logging.getLogger(__name__)


class HealthService:
    
    async def _get_collections(self):
        """Get database collections."""
        db = await get_database()
        return {
            'medical_conditions': db.medical_conditions,
            'health_metrics': db.health_metrics,
            'health_goals': db.health_goals,
            'medical_documents': db.medical_documents,
            'goal_progress': db.goal_progress
        }

    # Medical Conditions Methods
    async def get_medical_conditions(self, user_id: str) -> List[MedicalConditionResponse]:
        """Get all medical conditions for a user."""
        try:
            collections = await self._get_collections()
            conditions_collection = collections['medical_conditions']
            
            cursor = conditions_collection.find({"user_id": user_id})
            conditions = await cursor.to_list(length=None)
            
            response = []
            for condition in conditions:
                response.append(MedicalConditionResponse(
                    id=str(condition["_id"]),
                    name=condition["name"],
                    diagnosed=condition["diagnosed_date"].isoformat() if isinstance(condition["diagnosed_date"], date) else condition["diagnosed_date"],
                    status=condition["status"].title(),
                    severity=condition["severity"].title(),
                    medications=condition.get("medications", []),
                    lastUpdate=condition["updated_at"].isoformat() if isinstance(condition["updated_at"], datetime) else condition["updated_at"],
                    notes=condition.get("notes")
                ))
            
            return response
        except Exception as e:
            logger.error(f"Error getting medical conditions: {e}")
            return []

    async def create_medical_condition(self, user_id: str, condition_data: MedicalConditionCreate) -> Optional[MedicalConditionResponse]:
        """Create a new medical condition."""
        try:
            collections = await self._get_collections()
            conditions_collection = collections['medical_conditions']
            
            condition = MedicalCondition(
                user_id=user_id,
                name=condition_data.name,
                icd_code=condition_data.icd_code,
                diagnosed_date=condition_data.diagnosed_date,
                status=condition_data.status,
                severity=condition_data.severity,
                notes=condition_data.notes,
                diagnosed_by=condition_data.diagnosed_by,
                medications=condition_data.medications
            )
            
            result = await conditions_collection.insert_one(condition.dict(by_alias=True))
            condition.id = result.inserted_id
            
            return MedicalConditionResponse(
                id=str(condition.id),
                name=condition.name,
                diagnosed=condition.diagnosed_date.isoformat(),
                status=condition.status.value.title(),
                severity=condition.severity.value.title(),
                medications=condition.medications,
                lastUpdate=condition.updated_at.isoformat(),
                notes=condition.notes
            )
        except Exception as e:
            logger.error(f"Error creating medical condition: {e}")
            return None

    async def update_medical_condition(self, user_id: str, condition_id: str, update_data: MedicalConditionUpdate) -> Optional[MedicalConditionResponse]:
        """Update a medical condition."""
        try:
            collections = await self._get_collections()
            conditions_collection = collections['medical_conditions']
            
            update_fields: Dict[str, Any] = {"updated_at": datetime.utcnow()}
            
            if update_data.status is not None:
                update_fields["status"] = update_data.status.value
            if update_data.severity is not None:
                update_fields["severity"] = update_data.severity.value
            if update_data.medications is not None:
                update_fields["medications"] = update_data.medications
            if update_data.notes is not None:
                update_fields["notes"] = update_data.notes
            
            result = await conditions_collection.update_one(
                {"_id": ObjectId(condition_id), "user_id": user_id},
                {"$set": update_fields}
            )
            
            if result.modified_count > 0:
                updated_condition = await conditions_collection.find_one(
                    {"_id": ObjectId(condition_id), "user_id": user_id}
                )
                if updated_condition:
                    return MedicalConditionResponse(
                        id=str(updated_condition["_id"]),
                        name=updated_condition["name"],
                        diagnosed=updated_condition["diagnosed_date"].isoformat() if isinstance(updated_condition["diagnosed_date"], date) else updated_condition["diagnosed_date"],
                        status=updated_condition["status"].title(),
                        severity=updated_condition["severity"].title(),
                        medications=updated_condition.get("medications", []),
                        lastUpdate=updated_condition["updated_at"].isoformat(),
                        notes=updated_condition.get("notes")
                    )
            
            return None
        except Exception as e:
            logger.error(f"Error updating medical condition: {e}")
            return None

    # Health Metrics Methods
    async def get_health_metrics(self, user_id: str, metric_type: Optional[str] = None, 
                               date_from: Optional[date] = None, date_to: Optional[date] = None) -> List[HealthMetricResponse]:
        """Get health metrics for a user."""
        try:
            collections = await self._get_collections()
            metrics_collection = collections['health_metrics']
            
            # Build query
            query: Dict[str, Any] = {"user_id": user_id}
            if metric_type:
                query["metric_type"] = metric_type.lower().replace(" ", "_")
            if date_from or date_to:
                date_query: Dict[str, Any] = {}
                if date_from:
                    date_query["$gte"] = datetime.combine(date_from, datetime.min.time())
                if date_to:
                    date_query["$lte"] = datetime.combine(date_to, datetime.max.time())
                query["measured_at"] = date_query
            
            cursor = metrics_collection.find(query).sort("measured_at", -1)
            metrics = await cursor.to_list(length=None)
            
            response = []
            for metric in metrics:
                response.append(HealthMetricResponse(
                    date=metric["measured_at"].isoformat() if isinstance(metric["measured_at"], datetime) else metric["measured_at"],
                    type=metric["metric_type"].replace("_", " ").title(),
                    value=metric["value"],
                    unit=metric["unit"],
                    status=metric.get("status", "").title() if metric.get("status") else None,
                    notes=metric.get("notes")
                ))
            
            return response
        except Exception as e:
            logger.error(f"Error getting health metrics: {e}")
            return []

    async def create_health_metric(self, user_id: str, metric_data: HealthMetricCreate) -> Optional[HealthMetricResponse]:
        """Create a new health metric."""
        try:
            collections = await self._get_collections()
            metrics_collection = collections['health_metrics']
            
            # Calculate status based on metric type and value
            from models.health import MetricStatus
            status_str = self._calculate_metric_status(metric_data.metric_type, metric_data.value, 
                                                     metric_data.systolic, metric_data.diastolic)
            status = MetricStatus(status_str) if status_str else None
            
            metric = HealthMetric(
                user_id=user_id,
                metric_type=metric_data.metric_type,
                value=metric_data.value,
                unit=metric_data.unit,
                systolic=metric_data.systolic,
                diastolic=metric_data.diastolic,
                status=status,
                notes=metric_data.notes,
                measured_at=datetime.combine(metric_data.measured_at, datetime.min.time()),
                device_used=metric_data.device_used,
                location=metric_data.location
            )
            
            result = await metrics_collection.insert_one(metric.dict(by_alias=True))
            metric.id = result.inserted_id
            
            return HealthMetricResponse(
                date=metric.measured_at.isoformat(),
                type=metric.metric_type.value.replace("_", " ").title(),
                value=metric.value,
                unit=metric.unit,
                status=metric.status.value.title() if metric.status else None,
                notes=metric.notes
            )
        except Exception as e:
            logger.error(f"Error creating health metric: {e}")
            return None

    def _calculate_metric_status(self, metric_type: MetricType, value: str, systolic: Optional[int], diastolic: Optional[int]) -> Optional[str]:
        """Calculate status based on metric type and values."""
        try:
            if metric_type == MetricType.BLOOD_PRESSURE and systolic and diastolic:
                if systolic < 120 and diastolic < 80:
                    return "normal"
                elif systolic < 130 and diastolic < 80:
                    return "elevated"
                elif systolic < 140 or diastolic < 90:
                    return "high"
                else:
                    return "high"
            elif metric_type == MetricType.BLOOD_GLUCOSE:
                glucose_value = float(value)
                if glucose_value < 100:
                    return "normal"
                elif glucose_value < 125:
                    return "elevated"
                else:
                    return "high"
            elif metric_type == MetricType.HEART_RATE:
                hr_value = float(value)
                if 60 <= hr_value <= 100:
                    return "normal"
                elif hr_value < 60:
                    return "low"
                else:
                    return "high"
            # Add more logic for other metric types as needed
            return "normal"
        except:
            return "normal"

    # Health Goals Methods
    async def get_health_goals(self, user_id: str) -> List[HealthGoalResponse]:
        """Get all health goals for a user."""
        try:
            collections = await self._get_collections()
            goals_collection = collections['health_goals']
            
            cursor = goals_collection.find({"user_id": user_id})
            goals = await cursor.to_list(length=None)
            
            response = []
            for goal in goals:
                response.append(HealthGoalResponse(
                    id=str(goal["_id"]),
                    goal=goal["goal_title"],
                    target=goal["target_value"],
                    current=goal["current_value"],
                    unit=goal["unit"],
                    progress=goal["progress_percentage"],
                    deadline=goal["deadline"].isoformat() if goal.get("deadline") else None,
                    category=goal.get("category")
                ))
            
            return response
        except Exception as e:
            logger.error(f"Error getting health goals: {e}")
            return []

    async def create_health_goal(self, user_id: str, goal_data: HealthGoalCreate) -> Optional[HealthGoalResponse]:
        """Create a new health goal."""
        try:
            collections = await self._get_collections()
            goals_collection = collections['health_goals']
            
            goal = HealthGoal(
                user_id=user_id,
                goal_title=goal_data.goal_title,
                target_value=goal_data.target_value,
                unit=goal_data.unit,
                deadline=goal_data.deadline,
                category=goal_data.category,
                priority=goal_data.priority,
                notes=goal_data.notes
            )
            
            result = await goals_collection.insert_one(goal.dict(by_alias=True))
            goal.id = result.inserted_id
            
            return HealthGoalResponse(
                id=str(goal.id),
                goal=goal.goal_title,
                target=goal.target_value,
                current=goal.current_value,
                unit=goal.unit,
                progress=goal.progress_percentage,
                deadline=goal.deadline.isoformat() if goal.deadline else None,
                category=goal.category.value if goal.category else None
            )
        except Exception as e:
            logger.error(f"Error creating health goal: {e}")
            return None

    async def update_health_goal_progress(self, user_id: str, goal_id: str, progress_data: HealthGoalProgressUpdate) -> Optional[HealthGoalResponse]:
        """Update progress on a health goal."""
        try:
            collections = await self._get_collections()
            goals_collection = collections['health_goals']
            
            # Get current goal to calculate progress
            goal = await goals_collection.find_one({"_id": ObjectId(goal_id), "user_id": user_id})
            if not goal:
                return None
            
            # Calculate progress percentage
            try:
                current_val = float(progress_data.current_value)
                target_val = float(goal["target_value"])
                progress_percentage = min((current_val / target_val) * 100, 100) if target_val > 0 else 0
            except:
                progress_percentage = 0
            
            # Update goal
            update_fields = {
                "current_value": progress_data.current_value,
                "progress_percentage": progress_percentage,
                "updated_at": datetime.utcnow()
            }
            
            # Mark as completed if target reached
            if progress_percentage >= 100:
                update_fields["status"] = "completed"
            
            result = await goals_collection.update_one(
                {"_id": ObjectId(goal_id), "user_id": user_id},
                {"$set": update_fields}
            )
            
            if result.modified_count > 0:
                updated_goal = await goals_collection.find_one({"_id": ObjectId(goal_id), "user_id": user_id})
                if updated_goal:
                    return HealthGoalResponse(
                        id=str(updated_goal["_id"]),
                        goal=updated_goal["goal_title"],
                        target=updated_goal["target_value"],
                        current=updated_goal["current_value"],
                        unit=updated_goal["unit"],
                        progress=updated_goal["progress_percentage"],
                        deadline=updated_goal["deadline"].isoformat() if updated_goal.get("deadline") else None,
                        category=updated_goal.get("category")
                    )
            
            return None
        except Exception as e:
            logger.error(f"Error updating health goal progress: {e}")
            return None

    # Medical Documents Methods
    async def get_medical_documents(self, user_id: str, category: Optional[str] = None, 
                                  page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get medical documents for a user."""
        try:
            collections = await self._get_collections()
            documents_collection = collections['medical_documents']
            
            # Build query
            query = {"user_id": user_id}
            if category:
                query["category"] = category.lower()
            
            # Get total count
            total = await documents_collection.count_documents(query)
            
            # Get paginated results
            skip = (page - 1) * limit
            cursor = documents_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
            documents = await cursor.to_list(length=limit)
            
            response_data = []
            for doc in documents:
                # Format file size
                size_str = self._format_file_size(doc["file_size"])
                
                response_data.append(MedicalDocumentResponse(
                    id=str(doc["_id"]),
                    name=doc["document_name"],
                    type=doc["file_type"],
                    date=doc["document_date"].isoformat() if doc.get("document_date") else None,
                    size=size_str,
                    category=doc["category"].title(),
                    tags=doc.get("tags", []),
                    status=doc["status"].title(),
                    url=f"/api/health/documents/{doc['_id']}/download"  # Download URL
                ))
            
            return {
                "data": [doc.dict() for doc in response_data],
                "total": total,
                "page": page,
                "limit": limit,
                "hasMore": total > (page * limit)
            }
        except Exception as e:
            logger.error(f"Error getting medical documents: {e}")
            return {"data": [], "total": 0, "page": page, "limit": limit, "hasMore": False}

    async def upload_medical_document(self, user_id: str, file: UploadFile, upload_data: MedicalDocumentUpload) -> Optional[MedicalDocumentResponse]:
        """Upload a medical document."""
        try:
            collections = await self._get_collections()
            documents_collection = collections['medical_documents']
            
            # Create upload directory if it doesn't exist
            upload_dir = os.path.join("uploads", "medical_documents", user_id)
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate unique filename
            file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(upload_dir, unique_filename)
            
            # Save file
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Create document record
            document = MedicalDocument(
                user_id=user_id,
                document_name=file.filename or unique_filename,
                original_filename=file.filename or unique_filename,
                file_path=file_path,
                file_size=len(content),
                file_type=file_extension[1:] if file_extension else "unknown",
                mime_type=file.content_type or "application/octet-stream",
                category=upload_data.category,
                document_date=upload_data.document_date,
                description=upload_data.description,
                tags=upload_data.tags
            )
            
            result = await documents_collection.insert_one(document.dict(by_alias=True))
            document.id = result.inserted_id
            
            return MedicalDocumentResponse(
                id=str(document.id),
                name=document.document_name,
                type=document.file_type,
                date=document.document_date.isoformat() if document.document_date else None,
                size=self._format_file_size(document.file_size),
                category=document.category.value.title(),
                tags=document.tags,
                status=document.status.value.title(),
                url=f"/api/health/documents/{document.id}/download"
            )
        except Exception as e:
            logger.error(f"Error uploading medical document: {e}")
            return None

    async def delete_medical_document(self, user_id: str, document_id: str) -> bool:
        """Delete a medical document."""
        try:
            collections = await self._get_collections()
            documents_collection = collections['medical_documents']
            
            # Get document to delete file
            document = await documents_collection.find_one({"_id": ObjectId(document_id), "user_id": user_id})
            if not document:
                return False
            
            # Delete file from filesystem
            try:
                if os.path.exists(document["file_path"]):
                    os.remove(document["file_path"])
            except Exception as e:
                logger.warning(f"Could not delete file {document['file_path']}: {e}")
            
            # Delete document record
            result = await documents_collection.delete_one({"_id": ObjectId(document_id), "user_id": user_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting medical document: {e}")
            return False

    def _format_file_size(self, size_bytes: int) -> str:
        """Format file size in human readable format."""
        size = float(size_bytes)
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"


# Create singleton instance
health_service = HealthService()

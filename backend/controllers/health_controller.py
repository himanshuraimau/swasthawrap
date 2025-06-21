from fastapi import HTTPException, status, Depends, UploadFile, File, Form, Query # type: ignore
from typing import Optional, List
from datetime import date
import logging

from models.health import (
    MedicalConditionCreate, MedicalConditionUpdate,
    HealthMetricCreate, HealthGoalCreate, HealthGoalProgressUpdate,
    MedicalDocumentUpload, DocumentCategory
)
from services.health_service import health_service
from middlewares.auth import get_current_user

logger = logging.getLogger(__name__)


class HealthController:

    # Medical Conditions
    async def get_medical_conditions(self, current_user: str = Depends(get_current_user)) -> dict:
        """Get user's medical conditions."""
        try:
            conditions = await health_service.get_medical_conditions(current_user)
            return {
                "data": [condition.dict() for condition in conditions],
                "success": True
            }
        except Exception as e:
            logger.error(f"Error getting medical conditions: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def create_medical_condition(
        self, 
        condition_data: MedicalConditionCreate,
        current_user: str = Depends(get_current_user)
    ) -> dict:
        """Add a new medical condition."""
        try:
            condition = await health_service.create_medical_condition(current_user, condition_data)
            if not condition:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create medical condition"
                )
            
            return {
                "data": condition.dict(),
                "success": True,
                "message": "Medical condition added successfully"
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating medical condition: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def update_medical_condition(
        self,
        condition_id: str,
        update_data: MedicalConditionUpdate,
        current_user: str = Depends(get_current_user)
    ) -> dict:
        """Update an existing medical condition."""
        try:
            condition = await health_service.update_medical_condition(current_user, condition_id, update_data)
            if not condition:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Medical condition not found or update failed"
                )
            
            return {
                "data": condition.dict(),
                "success": True,
                "message": "Medical condition updated successfully"
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating medical condition: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    # Health Metrics
    async def get_health_metrics(
        self,
        metric_type: Optional[str] = Query(None),
        date_from: Optional[date] = Query(None),
        date_to: Optional[date] = Query(None),
        current_user: str = Depends(get_current_user)
    ) -> dict:
        """Get user's health metrics."""
        try:
            metrics = await health_service.get_health_metrics(
                current_user, metric_type, date_from, date_to
            )
            return {
                "data": [metric.dict() for metric in metrics],
                "success": True
            }
        except Exception as e:
            logger.error(f"Error getting health metrics: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def create_health_metric(
        self,
        metric_data: HealthMetricCreate,
        current_user: str = Depends(get_current_user)
    ) -> dict:
        """Add a new health metric reading."""
        try:
            metric = await health_service.create_health_metric(current_user, metric_data)
            if not metric:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create health metric"
                )
            
            return {
                "data": metric.dict(),
                "success": True,
                "message": "Health metric added successfully"
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating health metric: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    # Health Goals
    async def get_health_goals(self, current_user: str = Depends(get_current_user)) -> dict:
        """Get user's health goals."""
        try:
            goals = await health_service.get_health_goals(current_user)
            return {
                "data": [goal.dict() for goal in goals],
                "success": True
            }
        except Exception as e:
            logger.error(f"Error getting health goals: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def create_health_goal(
        self,
        goal_data: HealthGoalCreate,
        current_user: str = Depends(get_current_user)
    ) -> dict:
        """Create a new health goal."""
        try:
            goal = await health_service.create_health_goal(current_user, goal_data)
            if not goal:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create health goal"
                )
            
            return {
                "data": goal.dict(),
                "success": True,
                "message": "Health goal created successfully"
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating health goal: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def update_health_goal_progress(
        self,
        goal_id: str,
        progress_data: HealthGoalProgressUpdate,
        current_user: str = Depends(get_current_user)
    ) -> dict:
        """Update progress on a health goal."""
        try:
            goal = await health_service.update_health_goal_progress(current_user, goal_id, progress_data)
            if not goal:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Health goal not found or update failed"
                )
            
            return {
                "data": goal.dict(),
                "success": True,
                "message": "Health goal progress updated successfully"
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating health goal progress: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    # Medical Documents
    async def get_medical_documents(
        self,
        category: Optional[str] = Query(None),
        page: int = Query(1, ge=1),
        limit: int = Query(10, ge=1, le=100),
        current_user: str = Depends(get_current_user)
    ) -> dict:
        """Get user's uploaded medical documents."""
        try:
            result = await health_service.get_medical_documents(current_user, category, page, limit)
            return result
        except Exception as e:
            logger.error(f"Error getting medical documents: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def upload_medical_document(
        self,
        file: UploadFile = File(...),
        category: str = Form(...),
        tags: str = Form(""),  # Comma-separated tags
        description: Optional[str] = Form(None),
        document_date: Optional[date] = Form(None),
        current_user: str = Depends(get_current_user)
    ) -> dict:
        """Upload a medical document."""
        try:
            # Validate file
            if not file.filename:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File name is required"
                )
            
            # Check file size (50MB max)
            max_size = 50 * 1024 * 1024  # 50MB
            file_content = await file.read()
            if len(file_content) > max_size:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="File size exceeds 50MB limit"
                )
            
            # Reset file pointer
            await file.seek(0)
            
            # Parse tags
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
            
            # Validate category
            try:
                doc_category = DocumentCategory(category.lower())
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid category. Must be one of: {', '.join([c.value for c in DocumentCategory])}"
                )
            
            # Create upload data
            upload_data = MedicalDocumentUpload(
                category=doc_category,
                tags=tag_list,
                description=description,
                document_date=document_date
            )
            
            document = await health_service.upload_medical_document(current_user, file, upload_data)
            if not document:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to upload document"
                )
            
            return {
                "data": document.dict(),
                "success": True,
                "message": "Document uploaded successfully"
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error uploading medical document: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def delete_medical_document(
        self,
        document_id: str,
        current_user: str = Depends(get_current_user)
    ) -> dict:
        """Delete a medical document."""
        try:
            success = await health_service.delete_medical_document(current_user, document_id)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Document not found or delete failed"
                )
            
            return {
                "success": True,
                "message": "Document deleted successfully"
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting medical document: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )


# Create controller instance
health_controller = HealthController()

from fastapi import APIRouter, Depends, UploadFile, File, Form, Query # type: ignore
from typing import Optional
from datetime import date

from controllers.health_controller import health_controller
from middlewares.auth import get_current_user
from models.health import (
    MedicalConditionCreate, MedicalConditionUpdate,
    HealthMetricCreate, HealthGoalCreate, HealthGoalProgressUpdate
)

# Create router
router = APIRouter(prefix="/api/health", tags=["health"])


# Medical Conditions Routes
@router.get("/conditions")
async def get_medical_conditions(current_user: str = Depends(get_current_user)):
    """Get user's medical conditions."""
    return await health_controller.get_medical_conditions(current_user)


@router.post("/conditions")
async def create_medical_condition(
    condition_data: MedicalConditionCreate,
    current_user: str = Depends(get_current_user)
):
    """Add a new medical condition."""
    return await health_controller.create_medical_condition(condition_data, current_user)


@router.put("/conditions/{condition_id}")
async def update_medical_condition(
    condition_id: str,
    update_data: MedicalConditionUpdate,
    current_user: str = Depends(get_current_user)
):
    """Update an existing medical condition."""
    return await health_controller.update_medical_condition(condition_id, update_data, current_user)


# Health Metrics Routes
@router.get("/metrics")
async def get_health_metrics(
    metric_type: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    current_user: str = Depends(get_current_user)
):
    """Get user's health metrics."""
    return await health_controller.get_health_metrics(metric_type, date_from, date_to, current_user)


@router.post("/metrics")
async def create_health_metric(
    metric_data: HealthMetricCreate,
    current_user: str = Depends(get_current_user)
):
    """Add a new health metric reading."""
    return await health_controller.create_health_metric(metric_data, current_user)


# Health Goals Routes
@router.get("/goals")
async def get_health_goals(current_user: str = Depends(get_current_user)):
    """Get user's health goals."""
    return await health_controller.get_health_goals(current_user)


@router.post("/goals")
async def create_health_goal(
    goal_data: HealthGoalCreate,
    current_user: str = Depends(get_current_user)
):
    """Create a new health goal."""
    return await health_controller.create_health_goal(goal_data, current_user)


@router.put("/goals/{goal_id}/progress")
async def update_health_goal_progress(
    goal_id: str,
    progress_data: HealthGoalProgressUpdate,
    current_user: str = Depends(get_current_user)
):
    """Update progress on a health goal."""
    return await health_controller.update_health_goal_progress(goal_id, progress_data, current_user)


# Medical Documents Routes
@router.get("/documents")
async def get_medical_documents(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: str = Depends(get_current_user)
):
    """Get user's uploaded medical documents."""
    return await health_controller.get_medical_documents(category, page, limit, current_user)


@router.post("/documents/upload")
async def upload_medical_document(
    file: UploadFile = File(...),
    category: str = Form(...),
    tags: str = Form(""),
    description: Optional[str] = Form(None),
    document_date: Optional[date] = Form(None),
    current_user: str = Depends(get_current_user)
):
    """Upload a medical document."""
    return await health_controller.upload_medical_document(
        file, category, tags, description, document_date, current_user
    )


@router.delete("/documents/{document_id}")
async def delete_medical_document(
    document_id: str,
    current_user: str = Depends(get_current_user)
):
    """Delete a medical document."""
    return await health_controller.delete_medical_document(document_id, current_user)

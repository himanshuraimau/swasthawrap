from fastapi import APIRouter, Depends, Request # type: ignore
from controllers.auth_controller import auth_controller
from middlewares.auth import get_current_user
from models.user import (
    UserRegistration, UserLogin, UserProfile,
    ForgotPasswordRequest, ResetPasswordRequest
)

# Create router
router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register")
async def register(user_data: UserRegistration):
    """Register a new user account."""
    return await auth_controller.register(user_data)


@router.post("/login")
async def login(login_data: UserLogin):
    """Authenticate user with email and password."""
    return await auth_controller.login(login_data)


@router.get("/me")
async def get_current_user_data(current_user: str = Depends(get_current_user)):
    """Get current authenticated user details."""
    return await auth_controller.get_current_user_data(current_user)


@router.put("/profile")
async def update_profile(
    profile_data: UserProfile,
    current_user: str = Depends(get_current_user)
):
    """Update user profile information."""
    return await auth_controller.update_profile(profile_data, current_user)


@router.post("/logout")
async def logout(
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Logout user and invalidate token."""
    return await auth_controller.logout(request, current_user)


@router.post("/forgot-password")
async def forgot_password(request_data: ForgotPasswordRequest):
    """Send password reset email."""
    return await auth_controller.forgot_password(request_data)


@router.post("/reset-password")
async def reset_password(reset_data: ResetPasswordRequest):
    """Reset password using reset token."""
    return await auth_controller.reset_password(reset_data)

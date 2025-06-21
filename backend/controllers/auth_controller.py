from fastapi import HTTPException, status, Depends, Request # type: ignore
from typing import Optional
import logging

from models.user import (
    UserRegistration, UserLogin, UserProfile, 
    ForgotPasswordRequest, ResetPasswordRequest,
    UserResponse, UserResponseWithToken
)
from services.user_service import user_service
from middlewares.auth import get_current_user
from utils.auth import validate_password_strength

logger = logging.getLogger(__name__)


class AuthController:
    
    async def register(self, user_data: UserRegistration) -> dict:
        """Register a new user."""
        try:
            # Validate password strength
            if not validate_password_strength(user_data.password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password must be at least 8 characters long and contain uppercase, lowercase, and digit"
                )
            
            # Create user
            user_response = await user_service.create_user(user_data)
            
            return {
                "data": user_response.dict(),
                "success": True,
                "message": "User registered successfully"
            }
            
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            logger.error(f"Error during user registration: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error during registration"
            )

    async def login(self, login_data: UserLogin) -> dict:
        """Authenticate user and return token."""
        try:
            user_response = await user_service.authenticate_user(
                login_data.email, 
                login_data.password
            )
            
            if not user_response:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            return {
                "data": user_response.dict(),
                "success": True,
                "message": "Login successful"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during user login: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error during login"
            )

    async def get_current_user_data(self, current_user: str = Depends(get_current_user)) -> dict:
        """Get current authenticated user details."""
        try:
            user_response = await user_service.get_user_response(current_user)
            
            if not user_response:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            return {
                "data": user_response.dict(),
                "success": True
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting current user: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def update_profile(
        self, 
        profile_data: UserProfile, 
        current_user: str = Depends(get_current_user)
    ) -> dict:
        """Update user profile."""
        try:
            updated_user = await user_service.update_user_profile(current_user, profile_data)
            
            if not updated_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to update profile"
                )
            
            return {
                "data": updated_user.dict(),
                "success": True,
                "message": "Profile updated successfully"
            }
            
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error during profile update"
            )

    async def logout(
        self, 
        request: Request,
        current_user: str = Depends(get_current_user)
    ) -> dict:
        """Logout user and invalidate session."""
        try:
            # Extract token from Authorization header
            auth_header = request.headers.get("authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid authorization header"
                )
            
            session_token = auth_header.replace("Bearer ", "")
            
            # Logout user
            success = await user_service.logout_user(current_user, session_token)
            
            if success:
                return {
                    "success": True,
                    "message": "Logged out successfully"
                }
            else:
                return {
                    "success": True,
                    "message": "Session already expired"
                }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during logout: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error during logout"
            )

    async def forgot_password(self, request_data: ForgotPasswordRequest) -> dict:
        """Send password reset email."""
        try:
            reset_token = await user_service.create_password_reset(request_data.email)
            
            if reset_token:
                # TODO: Implement email sending here
                # For now, we'll just log the token (in production, send via email)
                logger.info(f"Password reset token for {request_data.email}: {reset_token}")
                
                return {
                    "success": True,
                    "message": "Password reset instructions sent to your email"
                }
            else:
                # Don't reveal if email exists or not for security
                return {
                    "success": True,
                    "message": "If the email exists, password reset instructions have been sent"
                }
            
        except Exception as e:
            logger.error(f"Error during forgot password: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def reset_password(self, reset_data: ResetPasswordRequest) -> dict:
        """Reset password using token."""
        try:
            # Validate password strength
            if not validate_password_strength(reset_data.new_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password must be at least 8 characters long and contain uppercase, lowercase, and digit"
                )
            
            success = await user_service.reset_password(
                reset_data.token, 
                reset_data.new_password
            )
            
            if success:
                return {
                    "success": True,
                    "message": "Password reset successfully"
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired reset token"
                )
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during password reset: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error during password reset"
            )


# Create controller instance
auth_controller = AuthController()

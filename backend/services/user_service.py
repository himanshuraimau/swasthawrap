from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase # type: ignore
from bson import ObjectId # type: ignore
import logging

from models.user import (
    User, UserRegistration, UserProfile, PasswordReset, 
    UserSession, UserResponse, UserResponseWithToken
)
from utils.auth import get_password_hash, verify_password, create_access_token, generate_reset_token, create_session_token
from database import get_database

logger = logging.getLogger(__name__)


class UserService:
    async def _get_collections(self):
        """Get database collections."""
        db = await get_database()
        return {
            'users': db.users,
            'password_resets': db.password_resets,
            'user_sessions': db.user_sessions
        }

    async def create_user(self, user_data: UserRegistration) -> UserResponseWithToken:
        """Create a new user account."""
        collections = await self._get_collections()
        users_collection = collections['users']
        user_sessions_collection = collections['user_sessions']
        
        # Check if user already exists
        existing_user = await users_collection.find_one({"email": user_data.email})
        if existing_user:
            raise ValueError("User with this email already exists")

        # Create user document
        user_dict = {
            "name": user_data.name,
            "email": user_data.email,
            "password_hash": get_password_hash(user_data.password),
            "language": user_data.language,
            "interests": user_data.interests,
            "health_score": 0,
            "streak": 0,
            "upcoming_appointments": 0,
            "medications_due": 0,
            "email_verified": False,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Insert user into database
        result = await users_collection.insert_one(user_dict)
        user_id = str(result.inserted_id)

        # Create access token
        access_token = create_access_token(
            data={"sub": user_id, "email": user_data.email}
        )

        # Create session
        await self._create_user_session(user_id, access_token, user_sessions_collection)

        return UserResponseWithToken(
            id=user_id,
            name=user_data.name,
            email=user_data.email,
            language=user_data.language,
            interests=user_data.interests,
            health_score=0,
            streak=0,
            upcoming_appointments=0,
            medications_due=0,
            avatar=None,
            token=access_token
        )

    async def authenticate_user(self, email: str, password: str) -> Optional[UserResponseWithToken]:
        """Authenticate user and return user data with token."""
        collections = await self._get_collections()
        users_collection = collections['users']
        user_sessions_collection = collections['user_sessions']
        
        user_doc = await users_collection.find_one({"email": email})
        if not user_doc:
            return None

        # Convert ObjectId to string for the id field
        user_doc["_id"] = str(user_doc["_id"])
        
        # Validate password
        if not verify_password(password, user_doc.get("password_hash", "")):
            return None

        if not user_doc.get("is_active", True):
            return None

        user_id = user_doc["_id"]

        # Create access token
        access_token = create_access_token(
            data={"sub": user_id, "email": email}
        )

        # Create session
        await self._create_user_session(user_id, access_token, user_sessions_collection)

        # Update user stats (you can implement this logic later)
        await self._update_user_stats(user_id, users_collection)

        return UserResponseWithToken(
            id=user_id,
            name=user_doc.get("name", ""),
            email=user_doc.get("email", ""),
            language=user_doc.get("language", "en"),
            interests=user_doc.get("interests", []),
            health_score=user_doc.get("health_score", 0),
            streak=user_doc.get("streak", 0),
            upcoming_appointments=user_doc.get("upcoming_appointments", 0),
            medications_due=user_doc.get("medications_due", 0),
            avatar=user_doc.get("avatar"),
            phone=user_doc.get("phone"),
            date_of_birth=user_doc.get("date_of_birth").isoformat() if user_doc.get("date_of_birth") else None,
            gender=user_doc.get("gender"),
            blood_group=user_doc.get("blood_group"),
            address=user_doc.get("address"),
            emergency_contact=user_doc.get("emergency_contact"),
            token=access_token
        )

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        try:
            collections = await self._get_collections()
            users_collection = collections['users']
            
            user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})
            if user_doc:
                # Convert ObjectId to string
                user_doc["_id"] = str(user_doc["_id"])
                # Create User object with converted data
                return User(**user_doc)
            return None
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None

    async def get_user_response(self, user_id: str) -> Optional[UserResponse]:
        """Get user response format by ID."""
        user = await self.get_user_by_id(user_id)
        if not user:
            return None

        return UserResponse(
            id=str(user.id) if user.id else user_id,
            name=user.name,
            email=user.email,
            language=user.language,
            interests=user.interests,
            health_score=user.health_score,
            streak=user.streak,
            upcoming_appointments=user.upcoming_appointments,
            medications_due=user.medications_due,
            avatar=user.avatar,
            phone=user.phone,
            date_of_birth=user.date_of_birth.isoformat() if user.date_of_birth else None,
            gender=user.gender,
            blood_group=user.blood_group,
            address=user.address,
            emergency_contact=user.emergency_contact
        )

    async def update_user_profile(self, user_id: str, profile_data: UserProfile) -> Optional[UserResponse]:
        """Update user profile."""
        try:
            collections = await self._get_collections()
            users_collection = collections['users']
            
            update_data: Dict[str, Any] = {
                "updated_at": datetime.utcnow()
            }
            
            # Only update fields that are provided
            if profile_data.name is not None:
                update_data["name"] = profile_data.name
            if profile_data.email is not None:
                # Check if email is already taken by another user
                existing_user = await users_collection.find_one({
                    "email": str(profile_data.email),
                    "_id": {"$ne": ObjectId(user_id)}
                })
                if existing_user:
                    raise ValueError("Email already taken by another user")
                update_data["email"] = str(profile_data.email)
            if profile_data.phone is not None:
                update_data["phone"] = profile_data.phone
            if profile_data.date_of_birth is not None:
                update_data["date_of_birth"] = profile_data.date_of_birth
            if profile_data.gender is not None:
                update_data["gender"] = profile_data.gender.value
            if profile_data.blood_group is not None:
                update_data["blood_group"] = profile_data.blood_group
            if profile_data.address is not None:
                update_data["address"] = profile_data.address
            if profile_data.emergency_contact is not None:
                update_data["emergency_contact"] = profile_data.emergency_contact.dict()

            # Update user in database
            result = await users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )

            if result.modified_count > 0:
                return await self.get_user_response(user_id)
            
            return None
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            return None

    async def create_password_reset(self, email: str) -> Optional[str]:
        """Create password reset token."""
        collections = await self._get_collections()
        users_collection = collections['users']
        password_resets_collection = collections['password_resets']
        
        user_doc = await users_collection.find_one({"email": email})
        if not user_doc:
            return None

        # Generate reset token
        reset_token = generate_reset_token()
        expires_at = datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour

        # Create password reset document
        reset_doc = {
            "email": email,
            "token": reset_token,
            "expires_at": expires_at,
            "used": False,
            "created_at": datetime.utcnow()
        }

        await password_resets_collection.insert_one(reset_doc)
        return reset_token

    async def reset_password(self, token: str, new_password: str) -> bool:
        """Reset password using token."""
        collections = await self._get_collections()
        users_collection = collections['users']
        password_resets_collection = collections['password_resets']
        
        # Find valid reset token
        reset_doc = await password_resets_collection.find_one({
            "token": token,
            "used": False,
            "expires_at": {"$gt": datetime.utcnow()}
        })

        if not reset_doc:
            return False

        # Update password
        new_password_hash = get_password_hash(new_password)
        result = await users_collection.update_one(
            {"email": reset_doc["email"]},
            {
                "$set": {
                    "password_hash": new_password_hash,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        if result.modified_count > 0:
            # Mark token as used
            await password_resets_collection.update_one(
                {"_id": reset_doc["_id"]},
                {"$set": {"used": True}}
            )
            return True

        return False

    async def logout_user(self, user_id: str, session_token: str) -> bool:
        """Logout user by invalidating session."""
        try:
            collections = await self._get_collections()
            user_sessions_collection = collections['user_sessions']
            
            result = await user_sessions_collection.delete_one({
                "user_id": user_id,
                "session_token": session_token
            })
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error logging out user: {e}")
            return False

    async def _create_user_session(self, user_id: str, session_token: str, user_sessions_collection, device_info: Optional[str] = None) -> bool:
        """Create a new user session."""
        try:
            session_doc = {
                "user_id": user_id,
                "session_token": session_token,
                "device_info": device_info,
                "ip_address": None,
                "location": None,
                "last_active": datetime.utcnow(),
                "expires_at": datetime.utcnow() + timedelta(minutes=30),  # 30 minutes
                "is_current": True,
                "created_at": datetime.utcnow()
            }

            # Mark other sessions as not current
            await user_sessions_collection.update_many(
                {"user_id": user_id},
                {"$set": {"is_current": False}}
            )

            # Insert new session
            await user_sessions_collection.insert_one(session_doc)
            return True
        except Exception as e:
            logger.error(f"Error creating user session: {e}")
            return False

    async def _update_user_stats(self, user_id: str, users_collection) -> None:
        """Update user statistics like streak, appointments, medications."""
        # This is a placeholder for calculating user statistics
        # You can implement the actual logic based on your business requirements
        try:
            # For now, we'll just update the last_active timestamp
            await users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
        except Exception as e:
            logger.error(f"Error updating user stats: {e}")


# Create a singleton instance
user_service = UserService()

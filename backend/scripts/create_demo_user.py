"""
Demo user creation script for SwasthWrap
Run this to create a demo user for testing authentication
"""
import asyncio
import sys
import os

# Add the parent directory to Python path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.user import UserRegistration, LanguageEnum
from services.user_service import user_service
from database import connect_to_mongo, close_mongo_connection

async def create_demo_user():
    """Create a demo user for testing"""
    try:
        await connect_to_mongo()
        print("Connected to database")
        
        # Demo user data
        demo_user = UserRegistration(
            name="Demo User",
            email="demo@swasthwrap.com",
            password="Demo123!",
            language=LanguageEnum.EN,
            interests=["diabetes", "heart", "nutrition"]
        )
        
        # Try to create the user
        try:
            user_response = await user_service.create_user(demo_user)
            print(f"Demo user created successfully!")
            print(f"Name: {user_response.name}")
            print(f"Email: {user_response.email}")
            print(f"ID: {user_response.id}")
        except ValueError as e:
            if "already exists" in str(e):
                print("Demo user already exists")
            else:
                print(f"Error creating demo user: {e}")
        
    except Exception as e:
        print(f"Database connection error: {e}")
    finally:
        await close_mongo_connection()
        print("Database connection closed")

if __name__ == "__main__":
    asyncio.run(create_demo_user())

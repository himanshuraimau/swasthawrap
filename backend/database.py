from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase # type: ignore
from pymongo.errors import ConnectionFailure # type: ignore
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class Database:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None


db = Database()


async def connect_to_mongo():
    """Create database connection"""
    try:
        from config import settings
        db.client = AsyncIOMotorClient(settings.mongodb_url)
        db.database = db.client[settings.database_name] # type: ignore
        
        # Test the connection
        if db.client is not None:
            await db.client.admin.command('ping')
            logger.info("Connected to MongoDB successfully")
        
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise e


async def close_mongo_connection():
    """Close database connection"""
    if db.client is not None:
        db.client.close()
        logger.info("Disconnected from MongoDB")


async def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    if db.database is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return db.database

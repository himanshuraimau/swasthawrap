from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from database import connect_to_mongo, close_mongo_connection
from routes.chat_routes import router as chat_router
from routes.auth_routes import router as auth_router
from routes.health_routes import router as health_router
from routes.dashboard_routes import router as dashboard_router
from routes.analytics_routes import router as analytics_router
from routes.sarvam_routes import router as sarvam_router
from routes.simple_sarvam_routes import router as simple_sarvam_router
# from routes.enhanced_chat_routes import router as enhanced_chat_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    logger.info("Starting up SwasthWrap Backend...")
    try:
        await connect_to_mongo()
        logger.info("Database connected successfully")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down SwasthWrap Backend...")
    await close_mongo_connection()


# Create FastAPI app
app = FastAPI(
    title="SwasthWrap Backend API",
    description="Backend API for SwasthWrap health management platform with AI chatbot",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(health_router)
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])
app.include_router(sarvam_router)  # Full Sarvam AI endpoints
app.include_router(simple_sarvam_router)  # Simplified Sarvam AI endpoints
# app.include_router(enhanced_chat_router, prefix="/api/chat", tags=["chat"])
app.include_router(chat_router)  # Keep for backward compatibility


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SwasthWrap Backend API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "SwasthWrap Backend"
    }


if __name__ == "__main__":
    import uvicorn
    from config import settings
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )

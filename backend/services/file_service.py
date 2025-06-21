import os
import aiofiles
import base64
from typing import Optional, Tuple
from fastapi import UploadFile # type: ignore
import uuid
from pathlib import Path
import logging
from config import settings

logger = logging.getLogger(__name__)


class FileService:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.audio_dir = self.upload_dir / "audio"
        self.documents_dir = self.upload_dir / "documents"
        self.temp_dir = self.upload_dir / "temp"
        
        # Create directories if they don't exist
        for dir_path in [self.upload_dir, self.audio_dir, self.documents_dir, self.temp_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
    
    async def save_uploaded_file(
        self,
        file: UploadFile,
        file_type: str = "document"
    ) -> Tuple[str, str, int]:
        """Save uploaded file and return file_id, file_path, file_size"""
        try:
            # Generate unique filename
            file_extension = Path(file.filename).suffix
            file_id = str(uuid.uuid4())
            filename = f"{file_id}{file_extension}"
            
            # Determine directory based on file type
            if file_type == "audio":
                file_path = self.audio_dir / filename
                relative_path = f"uploads/audio/{filename}"
            else:
                file_path = self.documents_dir / filename
                relative_path = f"uploads/documents/{filename}"
            
            # Save file
            content = await file.read()
            async with aiofiles.open(file_path, "wb") as f:
                await f.write(content)
            
            file_size = len(content)
            return file_id, relative_path, file_size
            
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            raise
    
    async def save_base64_file(
        self,
        base64_content: str,
        filename: str,
        file_type: str = "audio"
    ) -> Tuple[str, str, int]:
        """Save base64 encoded file and return file_id, file_path, file_size"""
        try:
            # Decode base64 content
            file_content = base64.b64decode(base64_content)
            
            # Generate unique filename
            file_extension = Path(filename).suffix
            file_id = str(uuid.uuid4())
            new_filename = f"{file_id}{file_extension}"
            
            # Determine directory based on file type
            if file_type == "audio":
                file_path = self.audio_dir / new_filename
                relative_path = f"uploads/audio/{new_filename}"
            else:
                file_path = self.documents_dir / new_filename
                relative_path = f"uploads/documents/{new_filename}"
            
            # Save file
            async with aiofiles.open(file_path, "wb") as f:
                await f.write(file_content)
            
            file_size = len(file_content)
            return file_id, relative_path, file_size
            
        except Exception as e:
            logger.error(f"Error saving base64 file: {e}")
            raise
    
    async def read_file_content(self, file_path: str) -> bytes:
        """Read file content as bytes"""
        try:
            async with aiofiles.open(file_path, "rb") as f:
                return await f.read()
        except Exception as e:
            logger.error(f"Error reading file: {e}")
            raise
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete file from filesystem"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return False
    
    def get_file_url(self, file_path: str, full_url: bool = False) -> str:
        """Generate file URL for serving static files"""
        # Since static files are mounted at /static and serve from uploads/ directory,
        # we need to remove the 'uploads/' prefix from the path
        if file_path.startswith("uploads/"):
            # Remove 'uploads/' prefix since /static already points to uploads directory
            relative_path = file_path[8:]  # Remove 'uploads/' (8 characters)
            relative_url = f"/static/{relative_path}"
        else:
            # Convert absolute path to relative URL
            try:
                relative_path = Path(file_path).relative_to(Path.cwd())
                if str(relative_path).startswith("uploads/"):
                    # Remove 'uploads/' prefix
                    clean_path = str(relative_path)[8:]
                    relative_url = f"/static/{clean_path}"
                else:
                    relative_url = f"/static/{relative_path}"
            except ValueError:
                # If relative_to fails, assume it's already relative
                relative_url = f"/static/{file_path}"
        
        # Return full URL if requested (needed for audio playback in frontend)
        if full_url:
            return f"{settings.backend_url}{relative_url}"
        
        return relative_url
    
    def is_valid_audio_file(self, filename: str) -> bool:
        """Check if file is a valid audio format"""
        valid_extensions = {".mp3", ".wav", ".m4a", ".ogg", ".flac"}
        return Path(filename).suffix.lower() in valid_extensions
    
    def is_valid_document_file(self, filename: str) -> bool:
        """Check if file is a valid document format"""
        valid_extensions = {".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png"}
        return Path(filename).suffix.lower() in valid_extensions
    
    async def create_temp_audio_file(self, audio_data: bytes, format: str = "wav") -> str:
        """Create temporary audio file for processing"""
        try:
            file_id = str(uuid.uuid4())
            filename = f"{file_id}.{format}"
            file_path = self.temp_dir / filename
            
            async with aiofiles.open(file_path, "wb") as f:
                await f.write(audio_data)
            
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Error creating temp audio file: {e}")
            raise
    
    async def cleanup_temp_files(self):
        """Clean up temporary files older than 1 hour"""
        try:
            import time
            current_time = time.time()
            
            for file_path in self.temp_dir.glob("*"):
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > 3600:  # 1 hour
                        await self.delete_file(str(file_path))
                        
        except Exception as e:
            logger.error(f"Error cleaning temp files: {e}")


# Global instance
file_service = FileService()

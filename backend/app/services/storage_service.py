"""
File storage service for managing uploaded contract documents.
"""

import os
import uuid
import shutil
import logging
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from app.config import settings

logger = logging.getLogger(__name__)


class StorageServiceError(Exception):
    """Custom exception for storage service errors."""
    pass


class StorageService:
    """Service for managing file storage."""

    def __init__(self):
        """Initialize storage service and ensure upload directory exists."""
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"StorageService initialized with upload dir: {self.upload_dir}")

    async def save_uploaded_file(self, upload_file: UploadFile) -> tuple[str, str, int]:
        """
        Save an uploaded file to the upload directory.

        Args:
            upload_file: FastAPI UploadFile object

        Returns:
            Tuple of (file_path, unique_filename, file_size)

        Raises:
            StorageServiceError: If file save fails
        """
        try:
            # Generate unique filename
            original_filename = upload_file.filename
            file_extension = Path(original_filename).suffix.lower()
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = self.upload_dir / unique_filename

            logger.info(f"Saving uploaded file: {original_filename} as {unique_filename}")

            # Save file
            file_size = 0
            with open(file_path, "wb") as buffer:
                while chunk := await upload_file.read(1024 * 1024):  # Read 1MB at a time
                    buffer.write(chunk)
                    file_size += len(chunk)

            logger.info(f"File saved successfully: {file_path} ({file_size} bytes)")

            return str(file_path), unique_filename, file_size

        except Exception as e:
            logger.error(f"Failed to save uploaded file: {str(e)}")
            # Clean up partial file if it exists
            if file_path.exists():
                file_path.unlink()
            raise StorageServiceError(f"Failed to save file: {str(e)}")

    def get_file_path(self, filename: str) -> Path:
        """
        Get the full path for a stored file.

        Args:
            filename: Name of the stored file

        Returns:
            Path object for the file

        Raises:
            StorageServiceError: If file doesn't exist
        """
        file_path = self.upload_dir / filename
        if not file_path.exists():
            raise StorageServiceError(f"File not found: {filename}")
        return file_path

    def delete_file(self, filename: str) -> bool:
        """
        Delete a stored file.

        Args:
            filename: Name of the file to delete

        Returns:
            True if file was deleted

        Raises:
            StorageServiceError: If deletion fails
        """
        try:
            file_path = self.upload_dir / filename
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Deleted file: {filename}")
                return True
            else:
                logger.warning(f"File not found for deletion: {filename}")
                return False
        except Exception as e:
            logger.error(f"Failed to delete file {filename}: {str(e)}")
            raise StorageServiceError(f"Failed to delete file: {str(e)}")

    def validate_file_type(self, filename: str) -> bool:
        """
        Validate that file type is allowed.

        Args:
            filename: Name of the file to validate

        Returns:
            True if file type is allowed

        Raises:
            StorageServiceError: If file type is not allowed
        """
        file_extension = Path(filename).suffix.lower().lstrip('.')
        allowed_extensions = settings.allowed_extensions_list

        if file_extension not in allowed_extensions:
            raise StorageServiceError(
                f"File type not allowed: .{file_extension}. "
                f"Allowed types: {', '.join(allowed_extensions)}"
            )

        return True

    def get_file_size_mb(self, filename: str) -> float:
        """
        Get file size in megabytes.

        Args:
            filename: Name of the file

        Returns:
            File size in MB
        """
        file_path = self.get_file_path(filename)
        size_bytes = file_path.stat().st_size
        return size_bytes / (1024 * 1024)

    def cleanup_old_files(self, days: int = 30) -> int:
        """
        Delete files older than specified days.

        Args:
            days: Number of days to keep files

        Returns:
            Number of files deleted
        """
        import time
        from datetime import datetime, timedelta

        cutoff_time = time.time() - (days * 24 * 60 * 60)
        deleted_count = 0

        try:
            for file_path in self.upload_dir.iterdir():
                if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                    file_path.unlink()
                    deleted_count += 1
                    logger.info(f"Cleaned up old file: {file_path.name}")

            logger.info(f"Cleanup complete: {deleted_count} files deleted")
            return deleted_count

        except Exception as e:
            logger.error(f"Cleanup failed: {str(e)}")
            raise StorageServiceError(f"Cleanup failed: {str(e)}")

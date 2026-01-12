"""
SQLAlchemy ORM models for database tables.
"""

import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database import Base


# Use native UUID for PostgreSQL, String for SQLite
def get_uuid_column():
    """Get appropriate UUID column type based on database."""
    return Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False
    )


class ContractStatus(str, enum.Enum):
    """Contract processing status enum."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"

    id = get_uuid_column()
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    contracts = relationship("Contract", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.username}>"


class Contract(Base):
    """Contract model for uploaded documents."""
    __tablename__ = "contracts"

    id = get_uuid_column()
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)  # Unique generated filename
    original_filename = Column(String(255), nullable=False)  # Original uploaded filename
    file_type = Column(String(10), nullable=False)  # pdf or docx
    file_size = Column(Integer, nullable=False)  # Size in bytes
    file_path = Column(String(500), nullable=False)  # Storage location
    upload_date = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    status = Column(Enum(ContractStatus), default=ContractStatus.UPLOADED, nullable=False, index=True)
    processing_started_at = Column(DateTime, nullable=True)
    processing_completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="contracts")
    analysis = relationship("ContractAnalysis", back_populates="contract", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Contract {self.original_filename} ({self.status})>"


class ContractAnalysis(Base):
    """Contract analysis model for Claude extraction results."""
    __tablename__ = "contract_analysis"

    id = get_uuid_column()
    contract_id = Column(String(36), ForeignKey("contracts.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    raw_text = Column(Text, nullable=False)  # Extracted text from document
    extracted_data = Column(JSON, nullable=False)  # Structured data from Claude
    claude_model = Column(String(50), nullable=False)  # Model version used
    prompt_tokens = Column(Integer, nullable=False)
    completion_tokens = Column(Integer, nullable=False)
    analysis_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    contract = relationship("Contract", back_populates="analysis")
    extracted_fields = relationship("ExtractedField", back_populates="analysis", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ContractAnalysis for Contract {self.contract_id}>"


class ExtractedField(Base):
    """
    Extracted field model for normalized field storage.
    This allows for easier querying of specific fields across contracts.
    """
    __tablename__ = "extracted_fields"

    id = get_uuid_column()
    analysis_id = Column(String(36), ForeignKey("contract_analysis.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name = Column(String(100), nullable=False, index=True)  # e.g., "vendor_name", "contract_value"
    field_value = Column(Text, nullable=True)
    field_type = Column(String(50), nullable=False)  # string, number, date, currency, boolean
    confidence = Column(Integer, nullable=True)  # Optional confidence score (0-100)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    analysis = relationship("ContractAnalysis", back_populates="extracted_fields")

    def __repr__(self):
        return f"<ExtractedField {self.field_name}: {self.field_value}>"

"""
Pydantic schemas for request/response validation and serialization.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict
from app.models import ContractStatus


# User Schemas (commented out until authentication is implemented)
# class UserBase(BaseModel):
#     """Base user schema with common fields."""
#     username: str = Field(..., min_length=3, max_length=50)
#     email: str


# class UserCreate(UserBase):
#     """Schema for user registration."""
#     password: str = Field(..., min_length=8, max_length=100)


# class UserLogin(BaseModel):
#     """Schema for user login."""
#     username: str
#     password: str


# class UserResponse(UserBase):
#     """Schema for user response."""
#     id: str
#     is_active: bool
#     created_at: datetime

#     model_config = ConfigDict(from_attributes=True)


# class Token(BaseModel):
#     """Schema for JWT token response."""
#     access_token: str
#     token_type: str = "bearer"


# class TokenData(BaseModel):
#     """Schema for token payload data."""
#     username: Optional[str] = None


# Contract Schemas
class ContractBase(BaseModel):
    """Base contract schema."""
    original_filename: str
    file_type: str
    file_size: int


class ContractCreate(ContractBase):
    """Schema for creating a new contract."""
    filename: str
    file_path: str
    user_id: str


class ContractResponse(ContractBase):
    """Schema for contract response."""
    id: str
    filename: str
    upload_date: datetime
    status: ContractStatus
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContractListResponse(BaseModel):
    """Schema for paginated contract list response."""
    contracts: List[ContractResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Contract Analysis Schemas
class ExtractedDataSchema(BaseModel):
    """
    Schema for structured extracted data from Claude.
    This matches the JSON structure we expect from Claude's analysis.
    """
    vendor_information: Optional[Dict[str, Any]] = None
    financial_terms: Optional[Dict[str, Any]] = None
    service_details: Optional[Dict[str, Any]] = None
    contract_terms: Optional[Dict[str, Any]] = None
    compliance_and_legal: Optional[Dict[str, Any]] = None
    rcm_specific: Optional[Dict[str, Any]] = None
    additional_notes: Optional[str] = None


class AnalysisCreate(BaseModel):
    """Schema for creating analysis."""
    contract_id: str
    raw_text: str
    extracted_data: Dict[str, Any]
    claude_model: str
    prompt_tokens: int
    completion_tokens: int


class AnalysisResponse(BaseModel):
    """Schema for analysis response."""
    id: str
    contract_id: str
    raw_text: str
    extracted_data: Dict[str, Any]
    claude_model: str
    prompt_tokens: int
    completion_tokens: int
    analysis_date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContractWithAnalysis(ContractResponse):
    """Schema for contract with analysis data."""
    analysis: Optional[AnalysisResponse] = None


# Upload Response Schema
class UploadResponse(BaseModel):
    """Schema for file upload response."""
    contract_id: str
    status: str
    message: str


# Dashboard Schemas
class DashboardStats(BaseModel):
    """Schema for dashboard statistics."""
    total_contracts: int
    processed_contracts: int
    pending_contracts: int
    failed_contracts: int
    total_storage_mb: float


class RecentContract(BaseModel):
    """Schema for recent contract summary."""
    id: str
    original_filename: str
    upload_date: datetime
    status: ContractStatus

    model_config = ConfigDict(from_attributes=True)


# Error Response Schema
class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str
    error_code: Optional[str] = None

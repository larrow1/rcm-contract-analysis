"""
Contract API routes for uploading, analyzing, and retrieving contracts.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
import logging

from app.database import get_db
from app.models import Contract, ContractAnalysis, ContractStatus
from app.schemas import (
    ContractResponse,
    ContractListResponse,
    ContractWithAnalysis,
    UploadResponse,
    AnalysisResponse
)
from app.services.storage_service import StorageService, StorageServiceError
from app.services.document_parser import DocumentParser, DocumentParserError
from app.services.claude_service import ClaudeAnalysisService, ClaudeServiceError

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
storage_service = StorageService()
document_parser = DocumentParser()
claude_service = ClaudeAnalysisService()


async def process_contract_analysis(contract_id: str, db: Session):
    """
    Background task to analyze a contract.

    Args:
        contract_id: Contract ID to analyze
        db: Database session
    """
    try:
        # Get contract from database
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            logger.error(f"Contract not found: {contract_id}")
            return

        # Update status to processing
        contract.status = ContractStatus.PROCESSING
        contract.processing_started_at = datetime.utcnow()
        db.commit()

        logger.info(f"Starting analysis for contract {contract_id}")

        # Extract text from document
        try:
            document_text = await document_parser.extract_text(
                contract.file_path,
                contract.file_type
            )
        except DocumentParserError as e:
            logger.error(f"Document parsing failed for {contract_id}: {str(e)}")
            contract.status = ContractStatus.FAILED
            contract.error_message = f"Document parsing failed: {str(e)}"
            contract.processing_completed_at = datetime.utcnow()
            db.commit()
            return

        # Analyze with Claude
        try:
            analysis_result = await claude_service.analyze_contract(document_text)
        except ClaudeServiceError as e:
            logger.error(f"Claude analysis failed for {contract_id}: {str(e)}")
            contract.status = ContractStatus.FAILED
            contract.error_message = f"Analysis failed: {str(e)}"
            contract.processing_completed_at = datetime.utcnow()
            db.commit()
            return

        # Save analysis results
        analysis = ContractAnalysis(
            contract_id=contract_id,
            raw_text=document_text,
            extracted_data=analysis_result["extracted_data"],
            claude_model=analysis_result["model"],
            prompt_tokens=analysis_result["prompt_tokens"],
            completion_tokens=analysis_result["completion_tokens"]
        )
        db.add(analysis)

        # Update contract status
        contract.status = ContractStatus.COMPLETED
        contract.processing_completed_at = datetime.utcnow()
        db.commit()

        logger.info(f"Analysis completed successfully for contract {contract_id}")

    except Exception as e:
        logger.error(f"Unexpected error processing contract {contract_id}: {str(e)}")
        try:
            contract = db.query(Contract).filter(Contract.id == contract_id).first()
            if contract:
                contract.status = ContractStatus.FAILED
                contract.error_message = f"Unexpected error: {str(e)}"
                contract.processing_completed_at = datetime.utcnow()
                db.commit()
        except Exception as db_error:
            logger.error(f"Failed to update contract status: {str(db_error)}")


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_contract(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a contract document (PDF or DOCX) for analysis.

    Args:
        background_tasks: FastAPI background tasks
        file: Uploaded file
        db: Database session

    Returns:
        UploadResponse with contract ID and status

    Raises:
        HTTPException: If upload or validation fails
    """
    try:
        # Validate file type
        storage_service.validate_file_type(file.filename)

        # Save file
        try:
            file_path, unique_filename, file_size = await storage_service.save_uploaded_file(file)
        except StorageServiceError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

        # Get file extension
        file_extension = file.filename.split('.')[-1].lower()

        # Create contract record (without user for now)
        contract = Contract(
            filename=unique_filename,
            original_filename=file.filename,
            file_type=file_extension,
            file_size=file_size,
            file_path=file_path,
            status=ContractStatus.UPLOADED,
            user_id="system"  # Placeholder for now since we skipped auth
        )

        db.add(contract)
        db.commit()
        db.refresh(contract)

        logger.info(f"Contract uploaded: {contract.id} - {file.filename}")

        # Trigger background analysis
        # Note: We need to pass a new DB session to the background task
        from app.database import SessionLocal
        bg_db = SessionLocal()
        background_tasks.add_task(process_contract_analysis, contract.id, bg_db)

        return UploadResponse(
            contract_id=contract.id,
            status="uploaded",
            message="Contract uploaded successfully and queued for analysis"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("/", response_model=ContractListResponse)
async def list_contracts(
    page: int = 1,
    page_size: int = 10,
    status_filter: Optional[ContractStatus] = None,
    db: Session = Depends(get_db)
):
    """
    List all contracts with pagination.

    Args:
        page: Page number (1-indexed)
        page_size: Number of items per page
        status_filter: Optional filter by contract status
        db: Database session

    Returns:
        Paginated list of contracts
    """
    query = db.query(Contract)

    if status_filter:
        query = query.filter(Contract.status == status_filter)

    # Get total count
    total = query.count()

    # Apply pagination
    contracts = query.order_by(desc(Contract.upload_date))\
        .offset((page - 1) * page_size)\
        .limit(page_size)\
        .all()

    total_pages = (total + page_size - 1) // page_size

    return ContractListResponse(
        contracts=contracts,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{contract_id}", response_model=ContractWithAnalysis)
async def get_contract(contract_id: str, db: Session = Depends(get_db)):
    """
    Get a specific contract with its analysis results.

    Args:
        contract_id: Contract ID
        db: Database session

    Returns:
        Contract with analysis data

    Raises:
        HTTPException: If contract not found
    """
    contract = db.query(Contract).filter(Contract.id == contract_id).first()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contract not found: {contract_id}"
        )

    return contract


@router.delete("/{contract_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contract(contract_id: str, db: Session = Depends(get_db)):
    """
    Delete a contract and its associated files.

    Args:
        contract_id: Contract ID
        db: Database session

    Raises:
        HTTPException: If contract not found or deletion fails
    """
    contract = db.query(Contract).filter(Contract.id == contract_id).first()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contract not found: {contract_id}"
        )

    # Delete the physical file
    try:
        storage_service.delete_file(contract.filename)
    except StorageServiceError as e:
        logger.warning(f"Failed to delete file {contract.filename}: {str(e)}")

    # Delete from database (cascade will delete analysis)
    db.delete(contract)
    db.commit()

    logger.info(f"Contract deleted: {contract_id}")
    return None


@router.get("/{contract_id}/analysis", response_model=AnalysisResponse)
async def get_contract_analysis(contract_id: str, db: Session = Depends(get_db)):
    """
    Get the analysis results for a contract.

    Args:
        contract_id: Contract ID
        db: Database session

    Returns:
        Analysis results

    Raises:
        HTTPException: If contract or analysis not found
    """
    contract = db.query(Contract).filter(Contract.id == contract_id).first()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contract not found: {contract_id}"
        )

    if not contract.analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis not available for contract: {contract_id}"
        )

    return contract.analysis


@router.post("/{contract_id}/reanalyze", response_model=UploadResponse)
async def reanalyze_contract(
    contract_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Trigger re-analysis of an existing contract.

    Args:
        contract_id: Contract ID
        background_tasks: FastAPI background tasks
        db: Database session

    Returns:
        Response with status

    Raises:
        HTTPException: If contract not found
    """
    contract = db.query(Contract).filter(Contract.id == contract_id).first()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contract not found: {contract_id}"
        )

    # Delete existing analysis if any
    if contract.analysis:
        db.delete(contract.analysis)
        db.commit()

    # Reset contract status
    contract.status = ContractStatus.UPLOADED
    contract.processing_started_at = None
    contract.processing_completed_at = None
    contract.error_message = None
    db.commit()

    # Trigger background analysis
    from app.database import SessionLocal
    bg_db = SessionLocal()
    background_tasks.add_task(process_contract_analysis, contract_id, bg_db)

    return UploadResponse(
        contract_id=contract_id,
        status="queued",
        message="Contract queued for re-analysis"
    )

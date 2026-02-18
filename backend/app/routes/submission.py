from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy import and_
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..core.database import get_db
from ..core.dependencies import get_current_buyer
from ..models.user import User
from ..models.project import Project
from ..models.task import Task, Submission, SubmissionStatus
from ..schemas.task import SubmissionResponse, SubmissionReviewRequest, SubmissionActionResponse

router = APIRouter(prefix="/submissions", tags=["submissions"], dependencies=[Depends(get_current_buyer)])

@router.get("/projects/{project_id}", response_model=List[SubmissionResponse])
def get_project_submissions(
    project_id: int,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Get all submissions for a project (buyer's projects only)."""
    project = db.query(Project).filter(
        and_(Project.id == project_id, Project.buyer_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    submissions = db.query(Submission).join(Task).filter(
        Task.project_id == project_id
    ).all()
    
    return submissions

@router.get("/{submission_id}", response_model=SubmissionResponse)
def get_submission(
    submission_id: int,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Get submission details."""
    submission = db.query(Submission).join(Task).join(Project).filter(
        and_(Submission.id == submission_id, Project.buyer_id == current_user.id)
    ).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    return submission

@router.post("/{submission_id}/review", response_model=SubmissionActionResponse)
def review_submission(
    submission_id: int,
    data: SubmissionReviewRequest,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Review submission (accept or reject)."""
    submission = db.query(Submission).join(Task).join(Project).filter(
        and_(Submission.id == submission_id, Project.buyer_id == current_user.id)
    ).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    if submission.status != SubmissionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission has already been reviewed"
        )
    
    submission.status = data.status
    submission.rejection_reason = data.rejection_reason
    submission.reviewed_at = datetime.utcnow()
    
    # Update task status based on submission status
    task = submission.task
    if data.status == SubmissionStatus.ACCEPTED:
        task.status = "accepted"
    elif data.status == SubmissionStatus.REJECTED:
        task.status = "rejected"
    
    db.commit()
    db.refresh(submission)
    
    return {
        "message": f"Submission {data.status} successfully",
        "submission": submission
    }

@router.get("/{submission_id}/download")
def download_submission(
    submission_id: int,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Download submission file."""
    submission = db.query(Submission).join(Task).join(Project).filter(
        and_(Submission.id == submission_id, Project.buyer_id == current_user.id)
    ).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    return FileResponse(
        path=submission.file_path,
        filename=submission.file_name,
        media_type="application/zip"
    )

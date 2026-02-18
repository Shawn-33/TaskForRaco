from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..core.database import get_db
from ..core.dependencies import get_current_buyer
from ..models.user import User
from ..models.project import Project, ProjectStatus, ProjectRequest, ProjectAssignment, ProjectPayment
from ..schemas.project import (
    ProjectCreate, ProjectResponse, ProjectUpdate, ProjectDetailResponse,
    ProjectRequestResponse, AssignSolverRequest, ProjectActionResponse
)
from ..schemas.payment import ProjectPaymentResponse

router = APIRouter(prefix="/buyer", tags=["buyer"], dependencies=[Depends(get_current_buyer)])

@router.post("/projects", response_model=ProjectResponse)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Create a new project (buyers only)."""
    new_project = Project(
        title=project_data.title,
        description=project_data.description,
        budget=project_data.budget,
        buyer_id=current_user.id,
        status=ProjectStatus.OPEN
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    return new_project

@router.get("/projects", response_model=List[ProjectResponse])
def get_my_projects(
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all projects created by the buyer."""
    projects = db.query(Project).filter(
        Project.buyer_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return projects

@router.get("/projects/{project_id}", response_model=ProjectDetailResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Get project details (buyer's projects only)."""
    project = db.query(Project).filter(
        and_(Project.id == project_id, Project.buyer_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project

@router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Update project details (buyer's projects only)."""
    project = db.query(Project).filter(
        and_(Project.id == project_id, Project.buyer_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.status != ProjectStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update projects in OPEN status"
        )
    
    if project_data.title:
        project.title = project_data.title
    if project_data.description:
        project.description = project_data.description
    if project_data.budget:
        project.budget = project_data.budget
    if project_data.category:
        project.category = project_data.category
    
    db.commit()
    db.refresh(project)
    
    return project

@router.get("/projects/{project_id}/requests", response_model=List[ProjectRequestResponse])
def get_project_requests(
    project_id: int,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Get all requests for a project (buyer's projects only)."""
    project = db.query(Project).filter(
        and_(Project.id == project_id, Project.buyer_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    requests = db.query(ProjectRequest).filter(
        ProjectRequest.project_id == project_id
    ).all()
    
    return requests

@router.post("/projects/{project_id}/assign", response_model=ProjectActionResponse)
def assign_problem_solver(
    project_id: int,
    data: AssignSolverRequest,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Assign a problem solver to a project (buyer's projects only)."""
    project = db.query(Project).filter(
        and_(Project.id == project_id, Project.buyer_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.status != ProjectStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project must be in OPEN status to assign solver"
        )
    
    # Verify problem solver exists and is a problem solver
    solver = db.query(User).filter(User.id == data.problem_solver_id).first()
    if not solver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem solver not found"
        )
    
    # Check if there's a pending request from this solver
    request = db.query(ProjectRequest).filter(
        and_(
            ProjectRequest.project_id == project_id,
            ProjectRequest.problem_solver_id == data.problem_solver_id,
            ProjectRequest.status == "pending"
        )
    ).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending request from this problem solver"
        )
    
    # Assign solver to project
    project.assigned_solver_id = data.problem_solver_id
    project.status = ProjectStatus.ASSIGNED
    
    # Update request status
    request.status = "accepted"
    request.responded_at = datetime.utcnow()
    
    # Create assignment record
    assignment = ProjectAssignment(
        project_id=project_id,
        problem_solver_id=data.problem_solver_id
    )
    
    db.add(assignment)
    db.commit()
    db.refresh(project)
    
    return {
        "message": "Problem solver assigned successfully",
        "project": project
    }

@router.delete("/projects/{project_id}", response_model=dict)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Delete a project (buyer's projects only, OPEN status only)."""
    project = db.query(Project).filter(
        and_(Project.id == project_id, Project.buyer_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.status != ProjectStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete projects in OPEN status"
        )
    
    db.delete(project)
    db.commit()
    
    return {"message": "Project deleted successfully"}


@router.get("/projects/{project_id}/payment-requests", response_model=List[ProjectPaymentResponse])
def get_payment_requests(
    project_id: int,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Get payment requests for a project."""
    project = db.query(Project).filter(
        and_(Project.id == project_id, Project.buyer_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    payments = db.query(ProjectPayment).filter(
        ProjectPayment.project_id == project_id
    ).all()
    
    return payments

@router.post("/payments/{payment_id}/approve")
def approve_payment(
    payment_id: int,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Approve payment request and mark project as completed."""
    payment = db.query(ProjectPayment).join(Project).filter(
        and_(
            ProjectPayment.id == payment_id,
            Project.buyer_id == current_user.id
        )
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    if payment.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment is not in pending status"
        )
    
    # Update payment status
    payment.status = "released"
    payment.released_at = datetime.utcnow()
    
    # Update project status to completed
    project = db.query(Project).filter(Project.id == payment.project_id).first()
    if project:
        project.status = ProjectStatus.COMPLETED
    
    db.commit()
    db.refresh(payment)
    
    return {
        "message": "Payment approved and released successfully",
        "payment_id": payment.id,
        "amount": float(payment.amount),
        "status": payment.status
    }

@router.post("/payments/{payment_id}/reject")
def reject_payment(
    payment_id: int,
    rejection_reason: str,
    current_user: User = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Reject payment request."""
    payment = db.query(ProjectPayment).join(Project).filter(
        and_(
            ProjectPayment.id == payment_id,
            Project.buyer_id == current_user.id
        )
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    if payment.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment is not in pending status"
        )
    
    # Update payment with rejection
    payment.description = f"Rejected: {rejection_reason}"
    
    # Delete the payment request
    db.delete(payment)
    db.commit()
    
    return {
        "message": "Payment request rejected",
        "reason": rejection_reason
    }

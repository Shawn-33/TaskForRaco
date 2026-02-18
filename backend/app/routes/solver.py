from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy import and_
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os
import shutil

from ..core.database import get_db
from ..core.dependencies import get_current_problem_solver
from ..models.user import User, UserRole
from ..models.project import Project, ProjectStatus, ProjectRequest, ProjectPayment
from ..models.task import Task, TaskStatus, Submission, SubmissionStatus
from ..schemas.project import ProjectResponse, ProjectRequestResponse, ProjectActionResponse
from ..schemas.task import TaskCreate, TaskResponse, TaskDetailResponse, TaskUpdate
from ..schemas.payment import ProjectPaymentCreate

router = APIRouter(prefix="/solver", tags=["problem-solver"], dependencies=[Depends(get_current_problem_solver)])

@router.get("/projects", response_model=List[ProjectResponse])
def browse_projects(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Browse available projects (OPEN status)."""
    projects = db.query(Project).filter(
        Project.status == ProjectStatus.OPEN
    ).offset(skip).limit(limit).all()
    
    return projects

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project_details(
    project_id: int,
    db: Session = Depends(get_db)
):
    """Get project details."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.status == ProjectStatus.OPEN
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project

@router.post("/projects/{project_id}/request", response_model=ProjectActionResponse)
def request_project(
    project_id: int,
    current_user: User = Depends(get_current_problem_solver),
    db: Session = Depends(get_db)
):
    """Request to work on a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.status != ProjectStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is not available for requests"
        )
    
    # Check if already requested
    existing_request = db.query(ProjectRequest).filter(
        and_(
            ProjectRequest.project_id == project_id,
            ProjectRequest.problem_solver_id == current_user.id
        )
    ).first()
    
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already requested this project"
        )
    
    # Create request
    request = ProjectRequest(
        project_id=project_id,
        problem_solver_id=current_user.id,
        status="pending"
    )
    
    db.add(request)
    db.commit()
    
    return {
        "message": "Request submitted successfully",
        "project": project
    }

@router.get("/my-assignments", response_model=List[ProjectResponse])
def get_my_assignments(
    current_user: User = Depends(get_current_problem_solver),
    db: Session = Depends(get_db)
):
    """Get assigned projects."""
    projects = db.query(Project).filter(
        and_(
            Project.assigned_solver_id == current_user.id,
            Project.status.in_([ProjectStatus.ASSIGNED, ProjectStatus.IN_PROGRESS])
        )
    ).all()
    
    return projects

@router.get("/my-assignments/{project_id}")
def get_assigned_project_details(
    project_id: int,
    current_user: User = Depends(get_current_problem_solver),
    db: Session = Depends(get_db)
):
    """Get details of an assigned project."""
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.assigned_solver_id == current_user.id
        )
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not assigned to you"
        )
    
    # Get buyer name
    buyer = db.query(User).filter(User.id == project.buyer_id).first()
    
    # Convert to dict and add buyer_name
    project_dict = {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "budget": project.budget,
        "category": project.category,
        "status": project.status,
        "buyer_id": project.buyer_id,
        "buyer_name": buyer.full_name if buyer else "Unknown",
        "assigned_solver_id": project.assigned_solver_id,
        "created_at": project.created_at,
        "updated_at": project.updated_at
    }
    
    return project_dict

@router.post("/tasks", response_model=TaskResponse)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_problem_solver),
    db: Session = Depends(get_db)
):
    """Create a task/sub-module (only for assigned projects)."""
    # Verify user has an assigned project
    project = db.query(Project).filter(
        and_(
            Project.assigned_solver_id == current_user.id,
            Project.status.in_([ProjectStatus.ASSIGNED, ProjectStatus.IN_PROGRESS])
        )
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You don't have an assigned project"
        )
    
    new_task = Task(
        project_id=project.id,
        problem_solver_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        deadline=task_data.deadline,
        status=TaskStatus.CREATED
    )
    
    db.add(new_task)
    
    # Update project status to IN_PROGRESS
    if project.status == ProjectStatus.ASSIGNED:
        project.status = ProjectStatus.IN_PROGRESS
    
    db.commit()
    db.refresh(new_task)
    
    return new_task

@router.get("/tasks", response_model=List[TaskResponse])
def get_my_tasks(
    current_user: User = Depends(get_current_problem_solver),
    db: Session = Depends(get_db)
):
    """Get all tasks created by the problem solver."""
    tasks = db.query(Task).filter(
        Task.problem_solver_id == current_user.id
    ).all()
    
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskDetailResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_problem_solver),
    db: Session = Depends(get_db)
):
    """Get task details (own tasks only)."""
    task = db.query(Task).filter(
        and_(Task.id == task_id, Task.problem_solver_id == current_user.id)
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task

@router.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_problem_solver),
    db: Session = Depends(get_db)
):
    """Update task details (own tasks only)."""
    task = db.query(Task).filter(
        and_(Task.id == task_id, Task.problem_solver_id == current_user.id)
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task_data.title:
        task.title = task_data.title
    if task_data.description:
        task.description = task_data.description
    if task_data.deadline:
        task.deadline = task_data.deadline
    if task_data.status:
        task.status = task_data.status
    
    db.commit()
    db.refresh(task)
    
    return task

@router.post("/tasks/{task_id}/submit")
async def submit_task(
    task_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_problem_solver),
    db: Session = Depends(get_db)
):
    """Submit work as ZIP file."""
    task = db.query(Task).filter(
        and_(Task.id == task_id, Task.problem_solver_id == current_user.id)
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if not file.filename.endswith('.zip'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a ZIP archive"
        )
    
    # Create uploads directory
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Create unique file path
    file_path = os.path.join(upload_dir, f"task_{task_id}_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Create submission
    submission = Submission(
        task_id=task_id,
        problem_solver_id=current_user.id,
        file_path=file_path,
        file_name=file.filename,
        status=SubmissionStatus.PENDING
    )
    
    # Update task status
    task.status = TaskStatus.SUBMITTED
    
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    return {
        "message": "Task submitted successfully",
        "submission_id": submission.id,
        "file_name": submission.file_name
    }


@router.post("/projects/{project_id}/request-completion")
def request_project_completion(
    project_id: int,
    current_user: User = Depends(get_current_problem_solver),
    db: Session = Depends(get_db)
):
    """Request project completion and payment."""
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.assigned_solver_id == current_user.id
        )
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not assigned to you"
        )
    
    if project.status not in [ProjectStatus.ASSIGNED, ProjectStatus.IN_PROGRESS]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is not in a state that can be completed"
        )
    
    # Check if there's already a pending payment request
    existing_payment = db.query(ProjectPayment).filter(
        and_(
            ProjectPayment.project_id == project_id,
            ProjectPayment.status == "pending"
        )
    ).first()
    
    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment request already exists for this project"
        )
    
    # Create payment request
    payment = ProjectPayment(
        project_id=project_id,
        solver_id=current_user.id,
        amount=project.budget,
        status="pending",
        description="Project completion payment request"
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return {
        "message": "Project completion and payment requested successfully",
        "payment_id": payment.id,
        "amount": float(payment.amount),
        "status": payment.status
    }

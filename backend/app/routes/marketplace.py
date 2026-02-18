from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models.user import User, UserRole
from ..models.project import Project, ProjectStatus, ProjectCategory, ProjectRequest
from ..schemas.project import ProjectMarketplaceResponse, ProjectRequestCreate, ProjectRequestResponse

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

@router.get("/projects", response_model=List[ProjectMarketplaceResponse])
def browse_projects(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
    category: str = Query(None),
    search: str = Query(None),
    sort_by: str = Query("created_at", regex="^(created_at|budget|title)$")
):
    """Browse available projects in marketplace."""
    query = db.query(Project).filter(Project.status == ProjectStatus.OPEN)
    
    if category and category != "all":
        query = query.filter(Project.category == category)
    
    if search:
        query = query.filter(
            or_(
                Project.title.ilike(f"%{search}%"),
                Project.description.ilike(f"%{search}%")
            )
        )
    
    # Sort
    if sort_by == "budget":
        query = query.order_by(Project.budget.desc())
    elif sort_by == "title":
        query = query.order_by(Project.title.asc())
    else:
        query = query.order_by(Project.created_at.desc())
    
    projects = query.offset(skip).limit(limit).all()
    
    # Format response with application count
    result = []
    for project in projects:
        proj_data = ProjectMarketplaceResponse.from_orm(project)
        proj_data.applications_count = len(project.requests)
        proj_data.buyer_name = project.buyer.full_name
        result.append(proj_data)
    
    return result

@router.get("/projects/{project_id}", response_model=ProjectMarketplaceResponse)
def get_project_details(
    project_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed project information."""
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.status == ProjectStatus.OPEN
        )
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    proj_data = ProjectMarketplaceResponse.from_orm(project)
    proj_data.applications_count = len(project.requests)
    proj_data.buyer_name = project.buyer.full_name
    
    return proj_data

@router.get("/categories")
def get_categories():
    """Get list of project categories."""
    return {
        "categories": [
            {"id": "web_development", "name": "Web Development", "icon": "🌐"},
            {"id": "mobile_app", "name": "Mobile App", "icon": "📱"},
            {"id": "data_science", "name": "Data Science", "icon": "📊"},
            {"id": "ai_ml", "name": "AI/Machine Learning", "icon": "🤖"},
            {"id": "blockchain", "name": "Blockchain", "icon": "⛓️"},
            {"id": "devops", "name": "DevOps", "icon": "🔧"},
            {"id": "design", "name": "Design", "icon": "🎨"},
            {"id": "content", "name": "Content Creation", "icon": "✍️"},
            {"id": "other", "name": "Other", "icon": "📌"},
        ]
    }

@router.post("/projects/{project_id}/apply", response_model=ProjectRequestResponse)
def apply_for_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Solver applies to work on a project.
    Implements race condition handling - first to apply gets to talk to buyer first.
    """
    # Check if project exists and is open
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.status == ProjectStatus.OPEN
        )
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not available"
        )
    
    # Check if user is a problem solver
    print(current_user.role)
    if current_user.role != UserRole.PROBLEM_SOLVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only problem solvers can apply for projects"
        )
    
    # Check if user already applied
    existing_request = db.query(ProjectRequest).filter(
        and_(
            ProjectRequest.project_id == project_id,
            ProjectRequest.problem_solver_id == current_user.id
        )
    ).first()
    
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this project"
        )
    
    # Create new application request
    new_request = ProjectRequest(
        project_id=project_id,
        problem_solver_id=current_user.id,
        status="pending",
        requested_at=datetime.utcnow()
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return new_request

@router.get("/my-applications", response_model=List[ProjectRequestResponse])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all applications by current solver."""
    if current_user.role != UserRole.PROBLEM_SOLVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only problem solvers can view applications"
        )
    
    applications = db.query(ProjectRequest).filter(
        ProjectRequest.problem_solver_id == current_user.id
    ).order_by(ProjectRequest.requested_at.desc()).all()
    
    return applications

@router.get("/projects/{project_id}/applications", response_model=List[ProjectRequestResponse])
def get_project_applications(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all applications for a project (buyer only)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can view applications"
        )
    
    # Get applications ordered by time (first applied = first in queue)
    applications = db.query(ProjectRequest).filter(
        ProjectRequest.project_id == project_id
    ).order_by(ProjectRequest.requested_at.asc()).all()
    
    # Add solver names to response
    result = []
    for app in applications:
        app_data = ProjectRequestResponse.from_orm(app)
        solver = db.query(User).filter(User.id == app.problem_solver_id).first()
        if solver:
            app_data.solver_name = solver.full_name
        result.append(app_data)
    
    return result

@router.post("/applications/{application_id}/accept")
def accept_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept an application and assign solver to project (buyer only)."""
    # Get the application
    application = db.query(ProjectRequest).filter(
        ProjectRequest.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Get the project
    project = db.query(Project).filter(Project.id == application.project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check if current user is the project owner
    if project.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can accept applications"
        )

    # Check if project is still open
    if project.status != ProjectStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is no longer accepting applications"
        )

    # Check if application is pending
    if application.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application is not pending"
        )

    # Accept the application
    application.status = "accepted"
    application.responded_at = datetime.utcnow()

    # Assign solver to project
    project.assigned_solver_id = application.problem_solver_id
    project.status = ProjectStatus.ASSIGNED

    # Reject all other pending applications
    other_applications = db.query(ProjectRequest).filter(
        and_(
            ProjectRequest.project_id == project.id,
            ProjectRequest.id != application_id,
            ProjectRequest.status == "pending"
        )
    ).all()

    for other_app in other_applications:
        other_app.status = "rejected"
        other_app.responded_at = datetime.utcnow()

    db.commit()

    return {
        "message": "Application accepted and solver assigned",
        "application_id": application_id,
        "project_id": project.id
    }

@router.post("/applications/{application_id}/reject")
def reject_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject an application (buyer only)."""
    # Get the application
    application = db.query(ProjectRequest).filter(
        ProjectRequest.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Get the project
    project = db.query(Project).filter(Project.id == application.project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check if current user is the project owner
    if project.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can reject applications"
        )

    # Check if application is pending
    if application.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application is not pending"
        )

    # Reject the application
    application.status = "rejected"
    application.responded_at = datetime.utcnow()

    db.commit()

    return {
        "message": "Application rejected",
        "application_id": application_id
    }



@router.post("/applications/{application_id}/accept")
def accept_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept an application and assign solver to project (buyer only)."""
    # Get the application
    application = db.query(ProjectRequest).filter(
        ProjectRequest.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Get the project
    project = db.query(Project).filter(Project.id == application.project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if current user is the project owner
    if project.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can accept applications"
        )
    
    # Check if project is still open
    if project.status != ProjectStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is no longer accepting applications"
        )
    
    # Check if application is pending
    if application.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application is not pending"
        )
    
    # Accept the application
    application.status = "accepted"
    application.responded_at = datetime.utcnow()
    
    # Assign solver to project
    project.assigned_solver_id = application.problem_solver_id
    project.status = ProjectStatus.ASSIGNED
    
    # Reject all other pending applications
    other_applications = db.query(ProjectRequest).filter(
        and_(
            ProjectRequest.project_id == project.id,
            ProjectRequest.id != application_id,
            ProjectRequest.status == "pending"
        )
    ).all()
    
    for other_app in other_applications:
        other_app.status = "rejected"
        other_app.responded_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Application accepted and solver assigned",
        "application_id": application_id,
        "project_id": project.id
    }

@router.post("/applications/{application_id}/reject")
def reject_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject an application (buyer only)."""
    # Get the application
    application = db.query(ProjectRequest).filter(
        ProjectRequest.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Get the project
    project = db.query(Project).filter(Project.id == application.project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if current user is the project owner
    if project.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can reject applications"
        )
    
    # Check if application is pending
    if application.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application is not pending"
        )
    
    # Reject the application
    application.status = "rejected"
    application.responded_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Application rejected",
        "application_id": application_id
    }

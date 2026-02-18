from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models.user import User, UserRole
from ..models.project import Project, ProjectRequest
from ..schemas.user import UserResponse

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.get("/solver/{solver_id}")
def get_solver_profile(
    solver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get public profile of a problem solver."""
    solver = db.query(User).filter(
        User.id == solver_id,
        User.role == UserRole.PROBLEM_SOLVER
    ).first()
    
    if not solver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solver not found"
        )
    
    # Get solver's statistics
    total_applications = db.query(ProjectRequest).filter(
        ProjectRequest.problem_solver_id == solver_id
    ).count()
    
    accepted_applications = db.query(ProjectRequest).filter(
        ProjectRequest.problem_solver_id == solver_id,
        ProjectRequest.status == "accepted"
    ).count()
    
    completed_projects = db.query(Project).filter(
        Project.assigned_solver_id == solver_id,
        Project.status == "completed"
    ).count()
    
    active_projects = db.query(Project).filter(
        Project.assigned_solver_id == solver_id,
        Project.status.in_(["assigned", "in_progress"])
    ).count()
    
    return {
        "id": solver.id,
        "full_name": solver.full_name,
        "email": solver.email,
        "role": solver.role,
        "is_active": solver.is_active,
        "created_at": solver.created_at,
        "statistics": {
            "total_applications": total_applications,
            "accepted_applications": accepted_applications,
            "completed_projects": completed_projects,
            "active_projects": active_projects,
            "acceptance_rate": round((accepted_applications / total_applications * 100) if total_applications > 0 else 0, 1)
        }
    }

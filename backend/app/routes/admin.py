from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.dependencies import get_current_admin
from ..models.user import User, UserRole
from ..schemas.user import UserResponse, UserDetailResponse, UserRoleUpdate

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])

@router.get("/users", response_model=List[UserDetailResponse])
def get_all_users(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    """Get all users (admin only)."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=UserDetailResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user details (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.patch("/users/{user_id}/role", response_model=UserDetailResponse)
def assign_role(user_id: int, data: UserRoleUpdate, db: Session = Depends(get_db)):
    """Assign role to user (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role = data.role
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/users/{user_id}/deactivate", response_model=dict)
def deactivate_user(user_id: int, db: Session = Depends(get_db)):
    """Deactivate user (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate admin users"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": f"User {user.email} has been deactivated"}

@router.post("/users/{user_id}/activate", response_model=dict)
def activate_user(user_id: int, db: Session = Depends(get_db)):
    """Activate user (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    db.commit()
    
    return {"message": f"User {user.email} has been activated"}


@router.get("/stats")
def get_system_stats(db: Session = Depends(get_db)):
    """Get system statistics (admin only)."""
    from ..models.project import Project, ProjectStatus, ProjectPayment
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    buyers = db.query(User).filter(User.role == UserRole.BUYER).count()
    solvers = db.query(User).filter(User.role == UserRole.PROBLEM_SOLVER).count()
    admins = db.query(User).filter(User.role == UserRole.ADMIN).count()
    
    total_projects = db.query(Project).count()
    open_projects = db.query(Project).filter(Project.status == ProjectStatus.OPEN).count()
    in_progress_projects = db.query(Project).filter(
        Project.status.in_([ProjectStatus.ASSIGNED, ProjectStatus.IN_PROGRESS])
    ).count()
    completed_projects = db.query(Project).filter(Project.status == ProjectStatus.COMPLETED).count()
    
    total_payments = db.query(ProjectPayment).count()
    pending_payments = db.query(ProjectPayment).filter(ProjectPayment.status == "pending").count()
    released_payments = db.query(ProjectPayment).filter(ProjectPayment.status == "released").count()
    
    # Calculate total payment amounts
    from sqlalchemy import func
    total_payment_amount = db.query(func.sum(ProjectPayment.amount)).scalar() or 0
    released_payment_amount = db.query(func.sum(ProjectPayment.amount)).filter(
        ProjectPayment.status == "released"
    ).scalar() or 0
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "buyers": buyers,
            "solvers": solvers,
            "admins": admins
        },
        "projects": {
            "total": total_projects,
            "open": open_projects,
            "in_progress": in_progress_projects,
            "completed": completed_projects
        },
        "payments": {
            "total": total_payments,
            "pending": pending_payments,
            "released": released_payments,
            "total_amount": float(total_payment_amount),
            "released_amount": float(released_payment_amount)
        }
    }

@router.get("/projects")
def get_all_projects(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    """Get all projects (admin only)."""
    from ..models.project import Project
    
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects

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

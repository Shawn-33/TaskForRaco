from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models.user import User, UserRole
from ..models.project import Project, Sprint, Feature
from ..schemas.sprint import SprintCreate, SprintUpdate, SprintResponse, SprintDetailResponse
from ..schemas.sprint import FeatureCreate, FeatureUpdate, FeatureResponse

router = APIRouter(prefix="/sprints", tags=["sprints"])

# Sprint Management
@router.post("", response_model=SprintResponse)
def create_sprint(
    sprint_data: SprintCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new sprint for a project."""
    # Verify project ownership
    project = db.query(Project).filter(Project.id == sprint_data.project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can create sprints"
        )
    
    new_sprint = Sprint(
        project_id=sprint_data.project_id,
        title=sprint_data.title,
        description=sprint_data.description,
        start_date=sprint_data.start_date,
        end_date=sprint_data.end_date,
        order=sprint_data.order
    )
    
    db.add(new_sprint)
    db.commit()
    db.refresh(new_sprint)
    
    return new_sprint

@router.get("/project/{project_id}", response_model=List[SprintDetailResponse])
def get_project_sprints(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all sprints for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user is buyer or assigned solver
    if project.buyer_id != current_user.id and project.assigned_solver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this project"
        )
    
    sprints = db.query(Sprint).filter(
        Sprint.project_id == project_id
    ).order_by(Sprint.order).all()
    
    return sprints

@router.get("/{sprint_id}", response_model=SprintDetailResponse)
def get_sprint(
    sprint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sprint details with features."""
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    
    if not sprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sprint not found"
        )
    
    project = sprint.project
    if project.buyer_id != current_user.id and project.assigned_solver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this sprint"
        )
    
    return sprint

@router.put("/{sprint_id}", response_model=SprintResponse)
def update_sprint(
    sprint_id: int,
    sprint_data: SprintUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update sprint."""
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    
    if not sprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sprint not found"
        )
    
    project = sprint.project
    if project.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can update sprints"
        )
    
    # Update fields
    if sprint_data.title is not None:
        sprint.title = sprint_data.title
    if sprint_data.description is not None:
        sprint.description = sprint_data.description
    if sprint_data.start_date is not None:
        sprint.start_date = sprint_data.start_date
    if sprint_data.end_date is not None:
        sprint.end_date = sprint_data.end_date
    if sprint_data.order is not None:
        sprint.order = sprint_data.order
    
    sprint.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(sprint)
    
    return sprint

@router.delete("/{sprint_id}")
def delete_sprint(
    sprint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete sprint and its features."""
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    
    if not sprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sprint not found"
        )
    
    project = sprint.project
    if project.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can delete sprints"
        )
    
    db.delete(sprint)
    db.commit()
    
    return {"message": "Sprint deleted successfully"}

# Feature Management
@router.post("/features", response_model=FeatureResponse)
def create_feature(
    feature_data: FeatureCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new feature."""
    project = db.query(Project).filter(Project.id == feature_data.project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can create features"
        )
    
    new_feature = Feature(
        project_id=feature_data.project_id,
        sprint_id=feature_data.sprint_id,
        title=feature_data.title,
        description=feature_data.description,
        status=feature_data.status,
        priority=feature_data.priority,
        assigned_to_id=feature_data.assigned_to_id,
        estimated_hours=feature_data.estimated_hours,
        order=feature_data.order
    )
    
    db.add(new_feature)
    db.commit()
    db.refresh(new_feature)
    
    return new_feature

@router.get("/features/{feature_id}", response_model=FeatureResponse)
def get_feature(
    feature_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get feature details."""
    feature = db.query(Feature).filter(Feature.id == feature_id).first()
    
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    
    project = feature.project
    if project.buyer_id != current_user.id and project.assigned_solver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this feature"
        )
    
    return feature

@router.put("/features/{feature_id}", response_model=FeatureResponse)
def update_feature(
    feature_id: int,
    feature_data: FeatureUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update feature status, assignment, or details."""
    feature = db.query(Feature).filter(Feature.id == feature_id).first()
    
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    
    project = feature.project
    
    # Solvers can update status, others need to be owner
    if current_user.id == project.assigned_solver_id:
        if feature_data.status is not None:
            feature.status = feature_data.status
    elif current_user.id == project.buyer_id:
        # Buyer can update everything
        if feature_data.title is not None:
            feature.title = feature_data.title
        if feature_data.description is not None:
            feature.description = feature_data.description
        if feature_data.status is not None:
            feature.status = feature_data.status
        if feature_data.priority is not None:
            feature.priority = feature_data.priority
        if feature_data.assigned_to_id is not None:
            feature.assigned_to_id = feature_data.assigned_to_id
        if feature_data.estimated_hours is not None:
            feature.estimated_hours = feature_data.estimated_hours
        if feature_data.order is not None:
            feature.order = feature_data.order
        if feature_data.sprint_id is not None:
            feature.sprint_id = feature_data.sprint_id
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this feature"
        )
    
    feature.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(feature)
    
    return feature

@router.delete("/features/{feature_id}")
def delete_feature(
    feature_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete feature."""
    feature = db.query(Feature).filter(Feature.id == feature_id).first()
    
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    
    project = feature.project
    if project.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can delete features"
        )
    
    db.delete(feature)
    db.commit()
    
    return {"message": "Feature deleted successfully"}

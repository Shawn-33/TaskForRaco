from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

class FeatureBase(BaseModel):
    """Base feature schema."""
    title: str
    description: Optional[str] = None
    status: str = "todo"  # todo, in_progress, review, done
    priority: str = "medium"  # low, medium, high, critical
    assigned_to_id: Optional[int] = None
    estimated_hours: Optional[int] = None
    order: int = 0

class FeatureCreate(FeatureBase):
    """Create feature schema."""
    project_id: int
    sprint_id: Optional[int] = None

class FeatureUpdate(BaseModel):
    """Update feature schema."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to_id: Optional[int] = None
    estimated_hours: Optional[int] = None
    order: Optional[int] = None
    sprint_id: Optional[int] = None

class FeatureResponse(FeatureBase):
    """Feature response schema."""
    id: int
    project_id: int
    sprint_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SprintBase(BaseModel):
    """Base sprint schema."""
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    order: int = 1

class SprintCreate(SprintBase):
    """Create sprint schema."""
    project_id: int

class SprintUpdate(BaseModel):
    """Update sprint schema."""
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    order: Optional[int] = None

class SprintResponse(SprintBase):
    """Sprint response schema."""
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    features: List[FeatureResponse] = []
    
    class Config:
        from_attributes = True

class SprintDetailResponse(SprintResponse):
    """Sprint detail response with features."""
    features: List[FeatureResponse] = []

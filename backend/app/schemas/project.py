from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from ..models.project import ProjectStatus, ProjectCategory

class ProjectBase(BaseModel):
    title: str
    description: str
    budget: Decimal
    category: str = "other"

class ProjectCreate(ProjectBase):
    category: str = "other"

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[Decimal] = None
    category: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    status: ProjectStatus
    category: str
    buyer_id: int
    assigned_solver_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    pending_applications: Optional[int] = 0
    
    class Config:
        from_attributes = True

class ProjectDetailResponse(ProjectResponse):
    requests: List = []
    tasks: List = []
    sprints: List = []
    features: List = []
    
    class Config:
        from_attributes = True

class ProjectMarketplaceResponse(ProjectResponse):
    """Project listing for marketplace."""
    buyer_name: Optional[str] = None
    applications_count: int = 0
    completed_percentage: float = 0.0
    
    class Config:
        from_attributes = True

class ProjectRequestBase(BaseModel):
    project_id: int
    problem_solver_id: int

class ProjectRequestCreate(BaseModel):
    project_id: int

class ProjectRequestResponse(BaseModel):
    id: int
    project_id: int
    problem_solver_id: int
    solver_name: Optional[str] = None
    status: str
    requested_at: datetime
    responded_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AssignSolverRequest(BaseModel):
    problem_solver_id: int

class ProjectActionResponse(BaseModel):
    message: str
    project: Optional[ProjectResponse] = None
    
    class Config:
        from_attributes = True

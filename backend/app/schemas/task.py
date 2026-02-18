from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from ..models.task import TaskStatus, SubmissionStatus

class TaskBase(BaseModel):
    title: str
    description: str
    deadline: Optional[date] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[TaskStatus] = None

class TaskResponse(TaskBase):
    id: int
    project_id: int
    problem_solver_id: int
    status: TaskStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TaskDetailResponse(TaskResponse):
    submissions: List = []
    
    class Config:
        from_attributes = True

class SubmissionBase(BaseModel):
    file_name: str

class SubmissionResponse(BaseModel):
    id: int
    task_id: int
    problem_solver_id: int
    file_name: str
    file_path: str
    status: SubmissionStatus
    rejection_reason: Optional[str] = None
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SubmissionReviewRequest(BaseModel):
    """Request body for reviewing submissions."""
    status: SubmissionStatus
    rejection_reason: Optional[str] = None

class SubmissionActionResponse(BaseModel):
    message: str
    submission: Optional[SubmissionResponse] = None
    
    class Config:
        from_attributes = True

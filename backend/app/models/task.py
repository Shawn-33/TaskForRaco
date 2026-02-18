from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..core.database import Base

class TaskStatus(str, enum.Enum):
    """Task status states."""
    CREATED = "created"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class Task(Base):
    """Task/Sub-module model."""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    problem_solver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    deadline = Column(Date, nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.CREATED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    problem_solver = relationship("User", back_populates="tasks")
    submissions = relationship("Submission", back_populates="task", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Task {self.title} - {self.status}>"

class SubmissionStatus(str, enum.Enum):
    """Submission status states."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class Submission(Base):
    """Work submission model."""
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    problem_solver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.PENDING, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    
    # Relationships
    task = relationship("Task", back_populates="submissions")
    problem_solver = relationship("User", back_populates="submissions")
    
    def __repr__(self):
        return f"<Submission task={self.task_id} - {self.status}>"

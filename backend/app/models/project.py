from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey, Boolean, Float, Date, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..core.database import Base

class ProjectStatus(str, enum.Enum):
    """Project status states."""
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ProjectCategory(str, enum.Enum):
    """Project category/classification."""
    WEB_DEVELOPMENT = "web_development"
    MOBILE_APP = "mobile_app"
    DATA_SCIENCE = "data_science"
    AI_ML = "ai_ml"
    BLOCKCHAIN = "blockchain"
    DEVOPS = "devops"
    DESIGN = "design"
    CONTENT = "content"
    OTHER = "other"

class Project(Base):
    """Project model."""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(ProjectCategory), default=ProjectCategory.OTHER, nullable=False)
    budget = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.OPEN, nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_solver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    buyer = relationship("User", back_populates="projects_created", foreign_keys=[buyer_id])
    requests = relationship("ProjectRequest", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    sprints = relationship("Sprint", back_populates="project", cascade="all, delete-orphan")
    features = relationship("Feature", back_populates="project", cascade="all, delete-orphan")
    payments = relationship("ProjectPayment", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Project {self.title} - {self.status}>"

class ProjectRequest(Base):
    """Problem solver request to work on a project."""
    __tablename__ = "project_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    problem_solver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending", nullable=False)  # pending, accepted, rejected
    requested_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="requests")
    
    def __repr__(self):
        return f"<ProjectRequest project={self.project_id} solver={self.problem_solver_id} - {self.status}>"

class ProjectAssignment(Base):
    """Assignment of a problem solver to a project."""
    __tablename__ = "project_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    problem_solver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    problem_solver = relationship("User", back_populates="project_assignments")
    
    def __repr__(self):
        return f"<ProjectAssignment project={self.project_id} solver={self.problem_solver_id}>"

class Sprint(Base):
    """Sprint/Phase model for features."""
    __tablename__ = "sprints"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    order = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="sprints")
    features = relationship("Feature", back_populates="sprint", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Sprint {self.title}>"

class Feature(Base):
    """Feature/Task model assignable to sprints."""
    __tablename__ = "features"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    sprint_id = Column(Integer, ForeignKey("sprints.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="todo")  # todo, in_progress, review, done
    priority = Column(String, default="medium")  # low, medium, high, critical
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    estimated_hours = Column(Integer, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="features")
    sprint = relationship("Sprint", back_populates="features")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    
    def __repr__(self):
        return f"<Feature {self.title} - {self.status}>"

class ProjectPayment(Base):
    """Payment and payout tracking for projects."""
    __tablename__ = "project_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    solver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, default="pending")  # pending, released, paid
    stripe_payment_intent_id = Column(String, nullable=True)
    stripe_payout_id = Column(String, nullable=True)
    payment_method = Column(String, default="stripe")  # stripe, bank_transfer, etc
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    released_at = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="payments")
    solver = relationship("User", foreign_keys=[solver_id])
    
    def __repr__(self):
        return f"<ProjectPayment ${self.amount} - {self.status}>"

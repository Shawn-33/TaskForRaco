from sqlalchemy import Column, Integer, String, Enum, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..core.database import Base

class UserRole(str, enum.Enum):
    """User roles in the system."""
    ADMIN = "admin"
    BUYER = "buyer"
    PROBLEM_SOLVER = "problem_solver"

class User(Base):
    """User model."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.PROBLEM_SOLVER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    projects_created = relationship("Project", back_populates="buyer", foreign_keys="Project.buyer_id")
    project_assignments = relationship("ProjectAssignment", back_populates="problem_solver")
    tasks = relationship("Task", back_populates="problem_solver")
    submissions = relationship("Submission", back_populates="problem_solver")
    
    def __repr__(self):
        return f"<User {self.email} - {self.role}>"

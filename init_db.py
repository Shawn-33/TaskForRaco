"""
Utility script to initialize the database with test data
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.database import engine, Base, SessionLocal
from app.models import User, UserRole, Project, ProjectStatus
from app.core.security import get_password_hash

def init_db():
    """Initialize database with tables and test data"""
    
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")
    
    db = SessionLocal()
    
    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            print("Database already has data. Skipping initialization.")
            return
        
        print("\nCreating test users...")
        
        # Create admin user
        admin = User(
            email="admin@test.com",
            full_name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        db.add(admin)
        print("✓ Admin user created (admin@test.com / admin123)")
        
        # Create buyer user
        buyer = User(
            email="buyer@test.com",
            full_name="Test Buyer",
            hashed_password=get_password_hash("buyer123"),
            role=UserRole.BUYER
        )
        db.add(buyer)
        print("✓ Buyer user created (buyer@test.com / buyer123)")
        
        # Create problem solver users
        solver1 = User(
            email="solver1@test.com",
            full_name="Problem Solver 1",
            hashed_password=get_password_hash("solver123"),
            role=UserRole.PROBLEM_SOLVER
        )
        db.add(solver1)
        print("✓ Solver 1 created (solver1@test.com / solver123)")
        
        solver2 = User(
            email="solver2@test.com",
            full_name="Problem Solver 2",
            hashed_password=get_password_hash("solver123"),
            role=UserRole.PROBLEM_SOLVER
        )
        db.add(solver2)
        print("✓ Solver 2 created (solver2@test.com / solver123)")
        
        db.commit()
        
        print("\n✓ Database initialized successfully!")
        print("\nTest credentials:")
        print("  Admin: admin@test.com / admin123")
        print("  Buyer: buyer@test.com / buyer123")
        print("  Solver 1: solver1@test.com / solver123")
        print("  Solver 2: solver2@test.com / solver123")
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()

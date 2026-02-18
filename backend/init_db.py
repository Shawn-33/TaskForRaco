#!/usr/bin/env python
"""
Initialize the database with test data.
Run this script after installing dependencies to set up the database.
"""

import sys
from datetime import datetime, timedelta
from decimal import Decimal

from app.core.database import Base, engine, SessionLocal
from app.models import (
    User, UserRole, Project, ProjectStatus, ProjectCategory,
    ProjectRequest, Sprint, Feature, Task, Submission
)
from app.core.security import get_password_hash


def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")


def create_test_users():
    """Create test users for different roles."""
    print("\nCreating test users...")
    db = SessionLocal()
    
    users = [
        User(
            email="admin@test.com",
            full_name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        ),
        User(
            email="buyer@test.com",
            full_name="Buyer User",
            hashed_password=get_password_hash("buyer123"),
            role=UserRole.BUYER,
            is_active=True
        ),
        User(
            email="buyer2@test.com",
            full_name="Second Buyer",
            hashed_password=get_password_hash("buyer123"),
            role=UserRole.BUYER,
            is_active=True
        ),
        User(
            email="solver1@test.com",
            full_name="Problem Solver One",
            hashed_password=get_password_hash("solver123"),
            role=UserRole.PROBLEM_SOLVER,
            is_active=True
        ),
        User(
            email="solver2@test.com",
            full_name="Problem Solver Two",
            hashed_password=get_password_hash("solver123"),
            role=UserRole.PROBLEM_SOLVER,
            is_active=True
        ),
        User(
            email="solver3@test.com",
            full_name="Problem Solver Three",
            hashed_password=get_password_hash("solver123"),
            role=UserRole.PROBLEM_SOLVER,
            is_active=True
        ),
    ]
    
    for user in users:
        existing = db.query(User).filter(User.email == user.email).first()
        if not existing:
            db.add(user)
    

    db.commit()
    print(f"✓ Created {len(users)} test users")
    
    db.close()
    return users

    


def create_test_projects():
    """Create test projects."""
    print("\nCreating test projects...")
    db = SessionLocal()
    
    # Get the buyer user
    buyer = db.query(User).filter(User.email == "buyer@test.com").first()
    
    if not buyer:
        print("! Buyer user not found, skipping projects")
        db.close()
        return
    
    projects = [
        Project(
            title="Website Redesign",
            description="Complete redesign of company website with modern UI/UX",
            category=ProjectCategory.WEB_DEVELOPMENT,
            budget=Decimal("5000.00"),
            status=ProjectStatus.OPEN,
            buyer_id=buyer.id,
            created_at=datetime.utcnow(),
        ),
        Project(
            title="Mobile App Development",
            description="Build iOS and Android app for inventory management",
            category=ProjectCategory.MOBILE_APP,
            budget=Decimal("15000.00"),
            status=ProjectStatus.OPEN,
            buyer_id=buyer.id,
            created_at=datetime.utcnow(),
        ),
        Project(
            title="Data Analysis Dashboard",
            description="Create real-time analytics dashboard with charts and metrics",
            category=ProjectCategory.DATA_SCIENCE,
            budget=Decimal("8000.00"),
            status=ProjectStatus.OPEN,
            buyer_id=buyer.id,
            created_at=datetime.utcnow(),
        ),
        Project(
            title="API Integration",
            description="Integrate payment gateway and third-party APIs",
            category=ProjectCategory.OTHER,
            budget=Decimal("6000.00"),
            status=ProjectStatus.OPEN,
            buyer_id=buyer.id,
            created_at=datetime.utcnow(),
        ),
        Project(
            title="Cloud Migration",
            description="Migrate legacy system to AWS cloud infrastructure",
            category=ProjectCategory.DEVOPS,
            budget=Decimal("12000.00"),
            status=ProjectStatus.OPEN,
            buyer_id=buyer.id,
            created_at=datetime.utcnow(),
        ),
    ]
    
    for project in projects:
        existing = db.query(Project).filter(Project.title == project.title).first()
        if not existing:
            db.add(project)
    
    db.commit()
    print(f"✓ Created {len(projects)} test projects")
    
    db.close()
    return projects


def create_test_applications():
    """Create test applications (ProjectRequest) for projects."""
    print("\nCreating test applications...")
    db = SessionLocal()
    
    projects = db.query(Project).all()
    solvers = db.query(User).filter(User.role == UserRole.PROBLEM_SOLVER).all()
    
    if not projects or not solvers:
        print("! Projects or solvers not found, skipping applications")
        db.close()
        return
    
    application_count = 0
    for project in projects:
        # Add 2-3 solvers applying to each project
        num_applicants = min(3, len(solvers))
        for i, solver in enumerate(solvers[:num_applicants]):
            existing = db.query(ProjectRequest).filter(
                ProjectRequest.project_id == project.id,
                ProjectRequest.problem_solver_id == solver.id
            ).first()
            
            if not existing:
                # Stagger the request times to test race condition handling
                request_time = datetime.utcnow() - timedelta(days=5-i, hours=i)
                app_request = ProjectRequest(
                    project_id=project.id,
                    problem_solver_id=solver.id,
                    requested_at=request_time,
                    status="pending"
                )
                db.add(app_request)
                application_count += 1
    
    db.commit()
    print(f"✓ Created {application_count} test applications")
    
    db.close()


def create_test_sprints_and_features():
    """Create test sprints and features for a project."""
    print("\nCreating test sprints and features...")
    db = SessionLocal()
    
    # Get the mobile app project
    project = db.query(Project).filter(Project.title == "Mobile App Development").first()
    
    if not project:
        print("! Mobile App project not found, skipping sprints")
        db.close()
        return
    
    now = datetime.utcnow()
    
    # Create sprints
    sprint1 = Sprint(
        project_id=project.id,
        title="Sprint 1: Setup & Authentication",
        start_date=now.date(),
        end_date=(now + timedelta(days=14)).date(),
        order=1
    )
    
    sprint2 = Sprint(
        project_id=project.id,
        title="Sprint 2: Core Features",
        start_date=(now + timedelta(days=15)).date(),
        end_date=(now + timedelta(days=29)).date(),
        order=2
    )
    
    db.add(sprint1)
    db.add(sprint2)
    db.flush()  # Get the IDs
    
    # Create features for sprint 1
    features_sprint1 = [
        Feature(
            project_id=project.id,
            sprint_id=sprint1.id,
            title="Setup development environment",
            description="Configure React Native, build tools, and CI/CD",
            status="todo",
            priority="high",
            estimated_hours=8
        ),
        Feature(
            project_id=project.id,
            sprint_id=sprint1.id,
            title="User authentication (iOS & Android)",
            description="Implement login/signup flows",
            status="todo",
            priority="high",
            estimated_hours=16
        ),
        Feature(
            project_id=project.id,
            sprint_id=sprint1.id,
            title="User profile management",
            description="Allow users to update profile information",
            status="todo",
            priority="medium",
            estimated_hours=8
        ),
    ]
    
    # Create features for sprint 2
    features_sprint2 = [
        Feature(
            project_id=project.id,
            sprint_id=sprint2.id,
            title="Inventory listing page",
            description="Display all inventory items with search and filters",
            status="todo",
            priority="high",
            estimated_hours=12
        ),
        Feature(
            project_id=project.id,
            sprint_id=sprint2.id,
            title="Add/edit inventory items",
            description="Allow users to add and modify inventory",
            status="todo",
            priority="high",
            estimated_hours=10
        ),
    ]
    
    for feature in features_sprint1 + features_sprint2:
        db.add(feature)
    
    db.commit()
    print(f"✓ Created 2 sprints with 5 features")
    
    db.close()


def main():
    """Run all initialization steps."""
    try:
        print("=" * 60)
        print("Database Initialization Script")
        print("=" * 60)
        
        create_tables()
        create_test_users()
        create_test_projects()
        create_test_applications()
        create_test_sprints_and_features()
        
        print("\n" + "=" * 60)
        print("✓ Database initialization complete!")
        print("=" * 60)
        
        print("\nTest Credentials:")
        print("-" * 40)
        print("Admin:    admin@test.com / admin123")
        print("Buyer:    buyer@test.com / buyer123")
        print("Solver 1: solver1@test.com / solver123")
        print("Solver 2: solver2@test.com / solver123")
        print("Solver 3: solver3@test.com / solver123")
        print("-" * 40)
        
        print("\nNext steps:")
        print("1. Start backend: uvicorn app.main:app --reload")
        print("2. Start frontend: npm run dev (in frontend directory)")
        print("3. Login at http://localhost:3000")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error during initialization: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .core.database import Base, engine
from .routes import auth_router, admin_router, buyer_router, solver_router, submission_router
from .routes.marketplace import router as marketplace_router
from .routes.sprint import router as sprint_router
from .routes.payment import router as payment_router
from .routes.profile import router as profile_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Project Marketplace API",
    description="Role-based project marketplace workflow with Trello-like dashboard",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth")
app.include_router(admin_router, prefix="/api")
app.include_router(buyer_router, prefix="/api")
app.include_router(solver_router, prefix="/api")
app.include_router(submission_router, prefix="/api")
app.include_router(marketplace_router, prefix="/api")
app.include_router(sprint_router, prefix="/api")
app.include_router(payment_router, prefix="/api")
app.include_router(profile_router, prefix="/api")

@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Project Marketplace API",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

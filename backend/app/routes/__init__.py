from .auth import router as auth_router
from .admin import router as admin_router
from .buyer import router as buyer_router
from .solver import router as solver_router
from .submission import router as submission_router

__all__ = [
    "auth_router",
    "admin_router",
    "buyer_router",
    "solver_router",
    "submission_router",
]

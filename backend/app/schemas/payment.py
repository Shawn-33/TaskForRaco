from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal

class ProjectPaymentBase(BaseModel):
    """Base payment schema."""
    amount: Decimal
    description: Optional[str] = None
    payment_method: str = "stripe"

class ProjectPaymentCreate(ProjectPaymentBase):
    """Create payment schema."""
    project_id: int
    solver_id: int

class ProjectPaymentUpdate(BaseModel):
    """Update payment schema."""
    amount: Optional[Decimal] = None
    status: Optional[str] = None
    description: Optional[str] = None

class ProjectPaymentResponse(ProjectPaymentBase):
    """Payment response schema."""
    id: int
    project_id: int
    solver_id: int
    status: str
    stripe_payment_intent_id: Optional[str] = None
    stripe_payout_id: Optional[str] = None
    created_at: datetime
    released_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class PayoutRequest(BaseModel):
    """Request to create a payout."""
    payment_id: int
    stripe_account_id: str

class PayoutResponse(BaseModel):
    """Payout response schema."""
    payout_id: str
    status: str
    amount: Decimal
    arrival_date: datetime
    
    class Config:
        from_attributes = True

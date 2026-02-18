from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os

import stripe

from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models.user import User, UserRole
from ..models.project import Project, ProjectPayment
from ..schemas.payment import ProjectPaymentResponse, ProjectPaymentCreate, PayoutRequest, PayoutResponse

# Initialize Stripe API
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/projects/{project_id}/create-payment-intent")
def create_payment_intent(
    project_id: int,
    amount: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe payment intent for project budget."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can create payments"
        )
    
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency="usd",
            metadata={
                "project_id": project_id,
                "buyer_id": current_user.id
            }
        )
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "status": intent.status
        }
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )

@router.post("/projects/{project_id}/confirm-payment", response_model=ProjectPaymentResponse)
def confirm_payment(
    project_id: int,
    payment_intent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Confirm payment and create payment record."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if not project.assigned_solver_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No solver assigned to this project"
        )
    
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status != "succeeded":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment not completed"
            )
        
        # Create payment record
        payment = ProjectPayment(
            project_id=project_id,
            solver_id=project.assigned_solver_id,
            amount=intent.amount / 100,  # Convert from cents
            status="released",
            stripe_payment_intent_id=payment_intent_id,
            released_at=datetime.utcnow()
        )
        
        db.add(payment)
        db.commit()
        db.refresh(payment)
        
        return payment
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )

@router.get("/my-payments", response_model=List[ProjectPaymentResponse])
def get_my_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all payments for current user (solver)."""
    if current_user.role != UserRole.PROBLEM_SOLVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only problem solvers can view payments"
        )
    
    payments = db.query(ProjectPayment).filter(
        ProjectPayment.solver_id == current_user.id
    ).order_by(ProjectPayment.created_at.desc()).all()
    
    return payments

@router.get("/projects/{project_id}/payments", response_model=List[ProjectPaymentResponse])
def get_project_payments(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all payments for a project (buyer only)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can view payments"
        )
    
    payments = db.query(ProjectPayment).filter(
        ProjectPayment.project_id == project_id
    ).order_by(ProjectPayment.created_at.desc()).all()
    
    return payments

@router.post("/payout", response_model=PayoutResponse)
def create_payout(
    payout_request: PayoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe payout for a payment.
    Solver can request payout for completed work.
    """
    payment = db.query(ProjectPayment).filter(
        ProjectPayment.id == payout_request.payment_id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    if payment.solver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only request payout for your own payments"
        )
    
    if payment.status != "released":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment must be in 'released' state to create payout"
        )
    
    try:
        # Create payout to Stripe connected account
        payout = stripe.Payout.create(
            amount=int(float(payment.amount) * 100),
            currency="usd",
            method="instant",
            destination=payout_request.stripe_account_id,
            metadata={
                "payment_id": payment.id,
                "project_id": payment.project_id
            }
        )
        
        # Update payment record
        payment.status = "paid"
        payment.stripe_payout_id = payout.id
        payment.paid_at = datetime.utcnow()
        db.commit()
        
        return PayoutResponse(
            payout_id=payout.id,
            status=payout.status,
            amount=payment.amount,
            arrival_date=datetime.fromtimestamp(payout.arrival_date)
        )
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )

@router.get("/stats")
def get_payment_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment statistics for current user."""
    if current_user.role != UserRole.PROBLEM_SOLVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only problem solvers can view stats"
        )
    
    payments = db.query(ProjectPayment).filter(
        ProjectPayment.solver_id == current_user.id
    ).all()
    
    total_earned = sum(float(p.amount) for p in payments)
    paid_amount = sum(float(p.amount) for p in payments if p.status == "paid")
    pending_amount = sum(float(p.amount) for p in payments if p.status in ["pending", "released"])
    
    return {
        "total_earned": total_earned,
        "paid_amount": paid_amount,
        "pending_amount": pending_amount,
        "payment_count": len(payments)
    }

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.reimbursement_claim import ReimbursementClaim
from app.schemas.reimbursement_claim import (
    ReimbursementClaimCreate,
    ReimbursementClaimResponse
)


router = APIRouter(
    prefix="/reimbursement-claims",
    tags=["Reimbursements"]
)


@router.get(
    "/",
    response_model=list[ReimbursementClaimResponse]
)
def get_claims(
    db: Session = Depends(get_db)
):
    return db.query(ReimbursementClaim).all()


@router.get(
    "/{claim_id}",
    response_model=ReimbursementClaimResponse
)
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db)
):
    claim = db.query(ReimbursementClaim).filter(
        ReimbursementClaim.id == claim_id
    ).first()

    if not claim:
        raise HTTPException(
            status_code=404,
            detail="Reimbursement claim not found"
        )

    return claim


@router.post(
    "/",
    response_model=ReimbursementClaimResponse,
    status_code=201
)
def create_claim(
    claim_data: ReimbursementClaimCreate,
    db: Session = Depends(get_db)
):
    claim = ReimbursementClaim(
        employee_id=claim_data.employee_id,
        category=claim_data.category,
        expense_date=claim_data.expense_date,
        claim_amount=claim_data.claim_amount,
        currency=claim_data.currency,
        receipt_attachment=claim_data.receipt_attachment,
        approver_id=claim_data.approver_id,
        approval_status=claim_data.approval_status
    )

    db.add(claim)
    db.commit()
    db.refresh(claim)

    return claim


@router.put(
    "/{claim_id}",
    response_model=ReimbursementClaimResponse
)
def update_claim(
    claim_id: int,
    claim_data: ReimbursementClaimCreate,
    db: Session = Depends(get_db)
):
    claim = db.query(ReimbursementClaim).filter(
        ReimbursementClaim.id == claim_id
    ).first()

    if not claim:
        raise HTTPException(
            status_code=404,
            detail="Reimbursement claim not found"
        )

    for field, value in claim_data.model_dump().items():
        setattr(claim, field, value)

    db.commit()
    db.refresh(claim)

    return claim


@router.delete("/{claim_id}")
def delete_claim(
    claim_id: int,
    db: Session = Depends(get_db)
):
    claim = db.query(ReimbursementClaim).filter(
        ReimbursementClaim.id == claim_id
    ).first()

    if not claim:
        raise HTTPException(
            status_code=404,
            detail="Reimbursement claim not found"
        )

    db.delete(claim)
    db.commit()

    return {
        "message": "Reimbursement claim deleted successfully"
    }


@router.patch(
    "/{claim_id}/approve",
    response_model=ReimbursementClaimResponse
)
def approve_claim(
    claim_id: int,
    db: Session = Depends(get_db)
):
    claim = db.query(ReimbursementClaim).filter(
        ReimbursementClaim.id == claim_id
    ).first()

    if not claim:
        raise HTTPException(
            status_code=404,
            detail="Reimbursement claim not found"
        )

    claim.approval_status = "Approved"

    db.commit()
    db.refresh(claim)

    return claim


@router.patch(
    "/{claim_id}/reject",
    response_model=ReimbursementClaimResponse
)
def reject_claim(
    claim_id: int,
    db: Session = Depends(get_db)
):
    claim = db.query(ReimbursementClaim).filter(
        ReimbursementClaim.id == claim_id
    ).first()

    if not claim:
        raise HTTPException(
            status_code=404,
            detail="Reimbursement claim not found"
        )

    claim.approval_status = "Rejected"

    db.commit()
    db.refresh(claim)

    return claim
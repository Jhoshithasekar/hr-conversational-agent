from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.leave_balance import LeaveBalance
from app.schemas.leave_balance import (
    LeaveBalanceCreate,
    LeaveBalanceResponse,
    LeaveBalanceUpdate,
)


router = APIRouter(
    prefix="/leave-balances",
    tags=["Leave Balances"],
)


def get_balance_or_404(balance_id: int, db: Session) -> LeaveBalance:
    balance = db.query(LeaveBalance).filter(
        LeaveBalance.id == balance_id
    ).first()

    if not balance:
        raise HTTPException(
            status_code=404,
            detail="Leave balance not found",
        )

    return balance


def find_duplicate(
    employee_id: int,
    leave_type: str,
    year: int,
    db: Session,
    balance_id: int | None = None,
) -> LeaveBalance | None:
    query = db.query(LeaveBalance).filter(
        LeaveBalance.employee_id == employee_id,
        LeaveBalance.leave_type == leave_type,
        LeaveBalance.year == year,
    )

    if balance_id is not None:
        query = query.filter(LeaveBalance.id != balance_id)

    return query.first()


def apply_balance_values(
    balance: LeaveBalance,
    balance_data: LeaveBalanceCreate | LeaveBalanceUpdate,
) -> None:
    balance.employee_id = balance_data.employee_id
    balance.leave_type = balance_data.leave_type
    balance.total_entitlement = balance_data.total_entitlement
    balance.used_days = balance_data.used_days
    balance.remaining_days = (
        balance_data.total_entitlement - balance_data.used_days
    )
    balance.year = balance_data.year


@router.get("/", response_model=list[LeaveBalanceResponse])
def get_leave_balances(db: Session = Depends(get_db)):
    return db.query(LeaveBalance).all()


@router.get("/{balance_id}", response_model=LeaveBalanceResponse)
def get_leave_balance(
    balance_id: int,
    db: Session = Depends(get_db),
):
    return get_balance_or_404(balance_id, db)


@router.post("/", response_model=LeaveBalanceResponse, status_code=201)
def create_leave_balance(
    balance_data: LeaveBalanceCreate,
    db: Session = Depends(get_db),
):
    if find_duplicate(
        balance_data.employee_id,
        balance_data.leave_type,
        balance_data.year,
        db,
    ):
        raise HTTPException(
            status_code=409,
            detail="Leave balance already exists for this employee, leave type, and year",
        )

    balance = LeaveBalance()
    apply_balance_values(balance, balance_data)
    db.add(balance)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Leave balance could not be created because a duplicate or invalid reference exists",
        ) from None

    db.refresh(balance)
    return balance


@router.put("/{balance_id}", response_model=LeaveBalanceResponse)
def update_leave_balance(
    balance_id: int,
    balance_data: LeaveBalanceUpdate,
    db: Session = Depends(get_db),
):
    balance = get_balance_or_404(balance_id, db)

    if find_duplicate(
        balance_data.employee_id,
        balance_data.leave_type,
        balance_data.year,
        db,
        balance_id,
    ):
        raise HTTPException(
            status_code=409,
            detail="Leave balance already exists for this employee, leave type, and year",
        )

    apply_balance_values(balance, balance_data)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Leave balance could not be updated because a duplicate or invalid reference exists",
        ) from None

    db.refresh(balance)
    return balance


@router.delete("/{balance_id}")
def delete_leave_balance(
    balance_id: int,
    db: Session = Depends(get_db),
):
    balance = get_balance_or_404(balance_id, db)
    db.delete(balance)
    db.commit()

    return {"message": "Leave balance deleted successfully"}
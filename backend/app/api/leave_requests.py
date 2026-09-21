from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.leave_request import LeaveRequest
from app.schemas.leave_request import (
    LeaveRequestCreate,
    LeaveRequestUpdate,
    LeaveRequestResponse,
)

router = APIRouter(
    prefix="/leave-requests",
    tags=["Leave / WFH Requests"]
)


@router.get("/", response_model=list[LeaveRequestResponse])
def get_leave_requests(db: Session = Depends(get_db)):
    return db.query(LeaveRequest).all()


@router.get("/{request_id}", response_model=LeaveRequestResponse)
def get_leave_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    request = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Leave/WFH request not found"
        )

    return request


@router.post("/", response_model=LeaveRequestResponse)
def create_leave_request(
    request_data: LeaveRequestCreate,
    db: Session = Depends(get_db)
):
    new_request = LeaveRequest(**request_data.model_dump())

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


@router.put("/{request_id}", response_model=LeaveRequestResponse)
def update_leave_request(
    request_id: int,
    request_data: LeaveRequestUpdate,
    db: Session = Depends(get_db)
):
    request = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Leave/WFH request not found"
        )

    for key, value in request_data.model_dump().items():
        setattr(request, key, value)

    db.commit()
    db.refresh(request)

    return request


@router.delete("/{request_id}")
def delete_leave_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    request = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Leave/WFH request not found"
        )

    db.delete(request)
    db.commit()

    return {
        "message": "Leave/WFH request deleted successfully"
    }


@router.patch("/{request_id}/approve")
def approve_leave_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    request = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Leave/WFH request not found"
        )

    request.status = "Approved"

    db.commit()
    db.refresh(request)

    return {
        "message": "Leave/WFH request approved",
        "request_id": request.id,
        "status": request.status
    }


@router.patch("/{request_id}/reject")
def reject_leave_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    request = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Leave/WFH request not found"
        )

    request.status = "Rejected"

    db.commit()
    db.refresh(request)

    return {
        "message": "Leave/WFH request rejected",
        "request_id": request.id,
        "status": request.status
    }
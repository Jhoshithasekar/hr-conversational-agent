from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_employee
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.employee import Employee
from app.models.user_credential import UserCredential
from app.schemas.auth import LoginRequest, MeResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.email == credentials.email.lower())
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    credential = (
        db.query(UserCredential)
        .filter(UserCredential.employee_id == employee.id)
        .first()
    )

    if not credential or not credential.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive",
        )

    if not verify_password(credentials.password, credential.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if employee.status and employee.status.lower() != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive",
        )

    access_token = create_access_token(employee)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "employee_id": employee.id,
        "name": employee.name,
        "email": employee.email,
        "role": employee.role,
    }


@router.get("/me", response_model=MeResponse)
def get_current_user_profile(employee: Employee = Depends(get_current_employee)):
    return {
        "employee_id": employee.id,
        "name": employee.name,
        "email": employee.email,
        "role": employee.role,
    }


def create_credential_for_employee(
    db: Session,
    employee: Employee,
    password: str,
) -> UserCredential:
    user_credential = (
        db.query(UserCredential)
        .filter(UserCredential.employee_id == employee.id)
        .first()
    )

    if user_credential is None:
        user_credential = UserCredential(employee_id=employee.id)
        db.add(user_credential)

    user_credential.password_hash = hash_password(password)
    user_credential.is_active = True
    db.commit()
    db.refresh(user_credential)
    return user_credential

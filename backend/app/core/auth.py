from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.security import bearer_scheme, decode_access_token, get_bearer_credentials
from app.database import get_db
from app.models.employee import Employee
from app.models.user_credential import UserCredential


def get_current_employee(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Employee:
    token = get_bearer_credentials(credentials)
    payload = decode_access_token(token)

    employee_id = payload.get("sub")
    if employee_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    employee = db.query(Employee).filter(Employee.id == int(employee_id)).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    credential = (
        db.query(UserCredential)
        .filter(UserCredential.employee_id == employee.id)
        .first()
    )
    if not credential or not credential.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )

    if employee.status and employee.status.lower() != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )

    return employee


def get_current_user(employee: Employee = Depends(get_current_employee)) -> Employee:
    return employee


def require_manager_role(
    current_user: Employee = Depends(get_current_employee),
) -> Employee:
    role_norm = (current_user.role or "").strip().lower()
    if role_norm not in ["manager", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Manager or HR access required",
        )
    return current_user


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.employee import Employee
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeResponse
)


router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


@router.get("/", response_model=list[EmployeeResponse])
def get_employees(
    db: Session = Depends(get_db)
):
    return db.query(Employee).all()


@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse
)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return employee


@router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=201
)
def create_employee(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Employee).filter(
        Employee.email == employee_data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Employee email already exists"
        )

    employee = Employee(
        name=employee_data.name,
        email=employee_data.email,
        department_id=employee_data.department_id,
        manager_id=employee_data.manager_id,
        role=employee_data.role,
        status=employee_data.status
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee


@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse
)
def update_employee(
    employee_id: int,
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    employee.name = employee_data.name
    employee.email = employee_data.email
    employee.department_id = employee_data.department_id
    employee.manager_id = employee_data.manager_id
    employee.role = employee_data.role
    employee.status = employee_data.status

    db.commit()
    db.refresh(employee)

    return employee


@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    db.delete(employee)
    db.commit()

    return {
        "message": "Employee deleted successfully"
    }
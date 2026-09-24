from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.employee import Employee
from app.models.user_credential import UserCredential
from app.core.security import hash_password


def seed_neha_employee() -> None:
    db: Session = SessionLocal()
    try:
        employee = db.query(Employee).filter(Employee.email == "neha.sharma@example.com").first()
        if not employee:
            print("No employee record found for Neha Sharma. Create the employee first.")
            return

        credential = db.query(UserCredential).filter(UserCredential.employee_id == employee.id).first()
        if credential is None:
            credential = UserCredential(employee_id=employee.id)
            db.add(credential)

        credential.password_hash = hash_password("Neha@123")
        credential.is_active = True
        db.commit()
        print(f"Created auth credential for {employee.name} ({employee.email}).")
    finally:
        db.close()


if __name__ == "__main__":
    seed_neha_employee()

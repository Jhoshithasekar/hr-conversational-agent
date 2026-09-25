from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.employee import Employee
from app.models.user_credential import UserCredential
from app.core.security import hash_password


DEVELOPMENT_USERS = {
    "neha.sharma@example.com": "Neha@123",
    "rajesh.kumar@example.com": "Rajesh@123",
    "priya.patel@example.com": "Priya@123",
    "amit.singh@example.com": "Amit@123",
}


def seed_credentials() -> None:
    db: Session = SessionLocal()

    try:
        for email, password in DEVELOPMENT_USERS.items():

            employee = (
                db.query(Employee)
                .filter(Employee.email == email)
                .first()
            )

            if not employee:
                print(f"Employee not found: {email}")
                continue

            credential = (
                db.query(UserCredential)
                .filter(UserCredential.employee_id == employee.id)
                .first()
            )

            if credential is None:
                credential = UserCredential(
                    employee_id=employee.id
                )
                db.add(credential)

            credential.password_hash = hash_password(password)
            credential.is_active = True

            print(
                f"Credential ready for "
                f"{employee.name} ({employee.email})"
            )

        db.commit()
        print("\nDevelopment credentials created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_credentials()
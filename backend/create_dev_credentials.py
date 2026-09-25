from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.employee import Employee
from app.models.user_credential import UserCredential
from app.core.security import hash_password


DEVELOPMENT_USERS = {
    "neha.sharma@example.com": {
        "name": "Neha Sharma",
        "role": "Software Engineer",
        "password": "Neha@123",
        "department_id": 1,
    },
    "rajesh.kumar@example.com": {
        "name": "Rajesh Kumar",
        "role": "Manager",
        "password": "Rajesh@123",
        "department_id": 1,
    },
    "priya.patel@example.com": {
        "name": "Priya Patel",
        "role": "Software Engineer",
        "password": "Priya@123",
        "department_id": 1,
    },
    "amit.singh@example.com": {
        "name": "Amit Singh",
        "role": "Software Engineer",
        "password": "Amit@123",
        "department_id": 1,
    },
    "kavita.sharma@example.com": {
        "name": "Kavita Sharma",
        "role": "HR",
        "password": "Kavita@123",
        "department_id": 1,
    },
    "sunita.rao@example.com": {
        "name": "Sunita Rao",
        "role": "ICC",
        "password": "Sunita@123",
        "department_id": 1,
    },
}


def seed_credentials() -> None:
    db: Session = SessionLocal()

    try:
        for email, meta in DEVELOPMENT_USERS.items():
            employee = (
                db.query(Employee)
                .filter(Employee.email == email)
                .first()
            )

            if not employee:
                employee = Employee(
                    name=meta["name"],
                    email=email,
                    department_id=meta.get("department_id", 1),
                    role=meta["role"],
                    status="Active",
                )
                db.add(employee)
                db.flush()
                print(f"Created employee: {employee.name} ({employee.email}) with ID {employee.id}")

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

            credential.password_hash = hash_password(meta["password"])
            credential.is_active = True

            print(
                f"Credential ready for "
                f"{employee.name} ({employee.email}) [Role: {employee.role}, ID: {employee.id}]"
            )

        db.commit()
        print("\nDevelopment credentials verified and created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_credentials()
    seed_credentials()
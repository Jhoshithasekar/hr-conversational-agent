from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)

    email = Column(String(255), unique=True, nullable=False)

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=False
    )

    manager_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )

    role = Column(String(30), nullable=False)

    status = Column(String(20), nullable=False)
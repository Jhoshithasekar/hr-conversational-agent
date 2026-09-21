from pydantic import BaseModel, ConfigDict, EmailStr


class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    department_id: int
    manager_id: int | None = None
    role: str
    status: str


class EmployeeResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    department_id: int
    manager_id: int | None
    role: str
    status: str

    model_config = ConfigDict(from_attributes=True)
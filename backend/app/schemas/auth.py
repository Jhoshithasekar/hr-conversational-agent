from pydantic import BaseModel, ConfigDict, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    employee_id: int
    name: str
    email: EmailStr
    role: str


class MeResponse(BaseModel):
    employee_id: int
    name: str
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)

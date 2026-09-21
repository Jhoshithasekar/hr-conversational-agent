from pydantic import BaseModel, ConfigDict


class DepartmentCreate(BaseModel):
    name: str
    status: str


class DepartmentResponse(BaseModel):
    id: int
    name: str
    status: str

    model_config = ConfigDict(from_attributes=True)
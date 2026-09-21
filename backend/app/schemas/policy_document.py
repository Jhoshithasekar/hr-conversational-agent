from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PolicyDocumentCreate(BaseModel):
    title: str
    category: str
    version: str
    file_path: str
    target_audience: str
    effective_date: datetime
    index_status: str
    uploaded_by_id: int
    is_active: bool


class PolicyDocumentResponse(BaseModel):
    id: int
    title: str
    category: str
    version: str
    file_path: str
    target_audience: str
    effective_date: datetime
    index_status: str
    uploaded_by_id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
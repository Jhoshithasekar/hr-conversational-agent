from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class AuditLogCreate(BaseModel):
    user_id: int
    timestamp: datetime
    action: str
    prompt_text: str | None = None
    extracted_parameters: dict[str, Any] | None = None
    entity_type: str | None = None
    entity_id: int | None = None
    approver_action: str | None = None


class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    timestamp: datetime
    action: str
    prompt_text: str | None
    extracted_parameters: dict[str, Any] | None
    entity_type: str | None
    entity_id: int | None
    approver_action: str | None

    model_config = ConfigDict(from_attributes=True)
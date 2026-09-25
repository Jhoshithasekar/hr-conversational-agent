from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class LeaveRequestBase(BaseModel):
    employee_id: int
    request_type: str
    start_date: datetime
    end_date: datetime
    total_days: Decimal
    half_full_day: str | None = None
    reason: str
    approver_id: int
    status: str
    submitted_at: datetime | None = None
    manager_comment: str | None = None


class LeaveRequestCreate(LeaveRequestBase):
    pass


class LeaveRequestUpdate(LeaveRequestBase):
    pass


class LeaveRequestAction(BaseModel):
    comment: str | None = None


class LeaveRequestResponse(LeaveRequestBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
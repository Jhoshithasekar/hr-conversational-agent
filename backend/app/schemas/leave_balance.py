from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


LeaveType = Literal[
    "Sick",
    "Casual",
    "Earned",
    "Maternity",
    "Paternity",
]


class LeaveBalanceBase(BaseModel):
    employee_id: int = Field(gt=0)
    leave_type: LeaveType
    total_entitlement: Decimal = Field(ge=0)
    used_days: Decimal = Field(ge=0)
    remaining_days: Decimal | None = Field(default=None, ge=0)
    year: int = Field(ge=1900, le=2200)


class LeaveBalanceCreate(LeaveBalanceBase):
    pass


class LeaveBalanceUpdate(LeaveBalanceBase):
    pass


class LeaveBalanceResponse(LeaveBalanceBase):
    id: int
    remaining_days: Decimal

    model_config = ConfigDict(from_attributes=True)
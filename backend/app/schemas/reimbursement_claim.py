from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ReimbursementClaimCreate(BaseModel):
    employee_id: int
    category: str
    expense_date: datetime
    claim_amount: Decimal
    currency: str
    receipt_attachment: str
    approver_id: int
    approval_status: str


class ReimbursementClaimResponse(BaseModel):
    id: int
    employee_id: int
    category: str
    expense_date: datetime
    claim_amount: Decimal
    currency: str
    receipt_attachment: str
    approver_id: int
    approval_status: str

    model_config = ConfigDict(from_attributes=True)
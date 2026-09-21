from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey

from app.database import Base


class ReimbursementClaim(Base):
    __tablename__ = "reimbursement_claims"

    id = Column(Integer, primary_key=True, index=True)

    # Employee who submitted the claim
    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    # Category of the claim
    category = Column(String(50), nullable=False)

    # Date of the expense
    expense_date = Column(DateTime, nullable=False)

    # Amount claimed
    claim_amount = Column(Numeric(12, 2), nullable=False)

    # Currency (e.g., INR, USD)
    currency = Column(String(10), nullable=False)

    # Path/reference to the uploaded receipt
    receipt_attachment = Column(String(255), nullable=False)

    # Employee who approves the claim
    approver_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    # Approval status
    approval_status = Column(String(30), nullable=False)
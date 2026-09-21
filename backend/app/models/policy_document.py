from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey

from app.database import Base


class PolicyDocument(Base):
    __tablename__ = "policy_documents"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)

    category = Column(String(50), nullable=False)

    version = Column(String(20), nullable=False)

    file_path = Column(String(500), nullable=False)

    target_audience = Column(String(50), nullable=False)

    effective_date = Column(DateTime, nullable=False)

    index_status = Column(String(20), nullable=False)

    uploaded_by_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    is_active = Column(Boolean, nullable=False)
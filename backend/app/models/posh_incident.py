from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text

from app.database import Base


class PoshIncident(Base):
    __tablename__ = "posh_incidents"

    id = Column(Integer, primary_key=True, index=True)

    complainant_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )

    is_anonymous = Column(
        Boolean,
        nullable=False
    )

    respondent_name = Column(
        String(150),
        nullable=False
    )

    incident_date_period = Column(
        String(100),
        nullable=False
    )

    location_channel = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    evidence_files = Column(
        String(500),
        nullable=True
    )

    icc_case_officer_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )

    case_status = Column(
        String(30),
        nullable=False
    )
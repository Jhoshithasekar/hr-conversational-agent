from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.posh_incident import PoshIncident
from app.schemas.posh_incident import (
    PoshIncidentCreate,
    PoshIncidentResponse
)


router = APIRouter(
    prefix="/posh-incidents",
    tags=["POSH / Grievance"]
)


@router.get(
    "/",
    response_model=list[PoshIncidentResponse]
)
def get_posh_incidents(
    db: Session = Depends(get_db)
):
    return db.query(PoshIncident).all()


@router.get(
    "/{incident_id}",
    response_model=PoshIncidentResponse
)
def get_posh_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = db.query(PoshIncident).filter(
        PoshIncident.id == incident_id
    ).first()

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="POSH incident not found"
        )

    return incident


@router.post(
    "/",
    response_model=PoshIncidentResponse,
    status_code=201
)
def create_posh_incident(
    incident_data: PoshIncidentCreate,
    db: Session = Depends(get_db)
):
    incident = PoshIncident(
        complainant_id=incident_data.complainant_id,
        is_anonymous=incident_data.is_anonymous,
        respondent_name=incident_data.respondent_name,
        incident_date_period=incident_data.incident_date_period,
        location_channel=incident_data.location_channel,
        description=incident_data.description,
        evidence_files=incident_data.evidence_files,
        icc_case_officer_id=incident_data.icc_case_officer_id,
        case_status=incident_data.case_status
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return incident


@router.put(
    "/{incident_id}",
    response_model=PoshIncidentResponse
)
def update_posh_incident(
    incident_id: int,
    incident_data: PoshIncidentCreate,
    db: Session = Depends(get_db)
):
    incident = db.query(PoshIncident).filter(
        PoshIncident.id == incident_id
    ).first()

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="POSH incident not found"
        )

    for field, value in incident_data.model_dump().items():
        setattr(incident, field, value)

    db.commit()
    db.refresh(incident)

    return incident
from pydantic import BaseModel, ConfigDict


class PoshIncidentCreate(BaseModel):
    complainant_id: int | None = None
    is_anonymous: bool
    respondent_name: str
    incident_date_period: str
    location_channel: str
    description: str
    evidence_files: str | None = None
    icc_case_officer_id: int | None = None
    case_status: str


class PoshIncidentResponse(BaseModel):
    id: int
    complainant_id: int | None
    is_anonymous: bool
    respondent_name: str
    incident_date_period: str
    location_channel: str
    description: str
    evidence_files: str | None
    icc_case_officer_id: int | None
    case_status: str

    model_config = ConfigDict(from_attributes=True)
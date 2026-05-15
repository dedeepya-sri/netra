from datetime import datetime

from pydantic import BaseModel


class IncidentCreate(BaseModel):
    title: str
    severity: str
    status: str
    logs: str


class IncidentResponse(BaseModel):
    id: int
    title: str
    severity: str
    status: str
    logs: str
    created_at: datetime

    class Config:
        from_attributes = True


class IncidentEventResponse(BaseModel):
    id: str
    event_type: str
    incident_id: int
    title: str
    severity: str
    status: str
    created_at: datetime


class IncidentAnalysisResponse(BaseModel):
    incident_id: int
    summary: str
    probable_cause: str
    impact: str
    signals: list[str]
    recommended_actions: list[str]

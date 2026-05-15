from datetime import datetime

from pydantic import BaseModel
from pydantic import Field


class IncidentCreate(BaseModel):
    title: str
    severity: str
    status: str
    logs: str
    metrics: dict[str, float] = Field(default_factory=dict)


class IncidentStatusUpdate(BaseModel):
    status: str


class IncidentResponse(BaseModel):
    id: int
    title: str
    severity: str
    status: str
    logs: str
    metrics: dict[str, float]
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


class ServiceHealthResponse(BaseModel):
    name: str
    owner: str
    health: str
    active_incidents: int
    latest_severity: str | None
    latency_ms: float | None
    error_rate_percent: float | None


class IncidentAnalysisResponse(BaseModel):
    incident_id: int
    summary: str
    probable_cause: str
    impact: str
    risk_score: int
    priority: str
    signals: list[str]
    recommended_actions: list[str]


class IncidentCoachResponse(BaseModel):
    incident_id: int
    plain_summary: str
    why_it_matters: str
    first_steps: list[str]
    escalation_message: str
    questions_to_ask: list[str]


class IncidentPostmortemResponse(BaseModel):
    incident_id: int
    title: str
    executive_summary: str
    customer_impact: str
    root_cause: str
    detection: str
    resolution: str
    follow_up_actions: list[str]

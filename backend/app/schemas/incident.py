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


class MetricSummaryResponse(BaseModel):
    latency_ms: float
    error_rate_percent: float
    cpu_percent: float
    memory_percent: float


class ServiceIncidentSummaryResponse(BaseModel):
    service: str
    incident_count: int
    active_count: int


class ObservabilitySummaryResponse(BaseModel):
    total_incidents: int
    active_incidents: int
    resolved_incidents: int
    mttr_minutes_estimate: int
    status_counts: dict[str, int]
    severity_counts: dict[str, int]
    average_metrics: MetricSummaryResponse
    service_incidents: list[ServiceIncidentSummaryResponse]


class RunbookResponse(BaseModel):
    id: str
    title: str
    service: str
    summary: str
    symptoms: list[str]
    checks: list[str]
    mitigations: list[str]
    escalation: str


class IncidentRunbookMatchResponse(BaseModel):
    incident_id: int
    query: str
    matched_runbook: RunbookResponse
    confidence: float
    matched_terms: list[str]
    suggested_order: list[str]


class AgentTaskResponse(BaseModel):
    agent: str
    role: str
    goal: str
    tasks: list[str]
    handoff_to: str
    expected_output: str
    status: str


class IncidentWorkflowResponse(BaseModel):
    incident_id: int
    workflow_name: str
    priority: str
    summary: str
    agents: list[AgentTaskResponse]
    timeline: list[str]
    ready_to_resolve_checks: list[str]
    incident_commander_brief: str


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

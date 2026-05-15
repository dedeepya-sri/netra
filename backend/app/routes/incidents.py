import asyncio

from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.incident import Incident

from app.schemas.incident import IncidentAnalysisResponse
from app.schemas.incident import IncidentCoachResponse
from app.schemas.incident import IncidentCreate
from app.schemas.incident import IncidentEventResponse
from app.schemas.incident import IncidentPostmortemResponse
from app.schemas.incident import IncidentRunbookMatchResponse
from app.schemas.incident import IncidentResponse
from app.schemas.incident import IncidentSimulationRequest
from app.schemas.incident import IncidentStatusUpdate
from app.schemas.incident import IncidentWorkflowResponse
from app.schemas.incident import ObservabilitySummaryResponse
from app.schemas.incident import RunbookResponse
from app.schemas.incident import ServiceHealthResponse

from app.services.incident_analysis import analyze_incident
from app.services.incident_analysis import coach_incident
from app.services.incident_analysis import generate_postmortem
from app.services.incident_events import list_recent_incident_events
from app.services.incident_events import publish_incident_created
from app.services.incident_events import publish_incident_updated
from app.services.incident_events import read_incident_events
from app.services.incident_generator import generate_incident
from app.services.incident_workflow import build_incident_workflow
from app.services.observability import summarize_observability
from app.services.runbook_retrieval import list_runbooks
from app.services.runbook_retrieval import retrieve_runbook_for_incident
from app.services.service_health import summarize_service_health

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


@router.post("/", response_model=IncidentResponse)
async def create_incident(payload: IncidentCreate):
    db: Session = SessionLocal()

    incident = Incident(
        title=payload.title,
        severity=payload.severity,
        status=payload.status,
        logs=payload.logs,
        metrics=payload.metrics
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    publish_incident_created(incident)

    db.close()

    return incident


@router.get("/", response_model=list[IncidentResponse])
async def list_incidents():
    db: Session = SessionLocal()

    incidents = db.query(Incident).all()

    db.close()

    return incidents


@router.get("/events/recent", response_model=list[IncidentEventResponse])
async def list_recent_events(limit: int = 10):
    return list_recent_incident_events(limit)


@router.get("/services/health", response_model=list[ServiceHealthResponse])
async def list_service_health():
    db: Session = SessionLocal()

    incidents = db.query(Incident).all()

    db.close()

    return summarize_service_health(incidents)


@router.get("/runbooks", response_model=list[RunbookResponse])
async def get_runbooks():
    return list_runbooks()


@router.get("/observability", response_model=ObservabilitySummaryResponse)
async def get_observability_summary():
    db: Session = SessionLocal()

    incidents = db.query(Incident).all()

    db.close()

    return summarize_observability(incidents)


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: int,
    payload: IncidentStatusUpdate,
):
    allowed_statuses = {"open", "investigating", "resolved"}

    if payload.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid incident status")

    db: Session = SessionLocal()

    incident = db.query(Incident).filter(Incident.id == incident_id).first()

    if incident is None:
        db.close()
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = payload.status

    db.commit()
    db.refresh(incident)

    publish_incident_updated(incident)

    db.close()

    return incident


@router.websocket("/ws")
async def stream_incident_events(websocket: WebSocket):
    await websocket.accept()

    last_event_id = "$"

    try:
        while True:
            last_event_id, events = await asyncio.to_thread(
                read_incident_events,
                last_event_id,
            )

            for event in events:
                await websocket.send_json(event.model_dump(mode="json"))
    except WebSocketDisconnect:
        return


@router.get("/{incident_id}/analysis", response_model=IncidentAnalysisResponse)
async def get_incident_analysis(incident_id: int):
    db: Session = SessionLocal()

    incident = db.query(Incident).filter(Incident.id == incident_id).first()

    db.close()

    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    return analyze_incident(incident)


@router.get("/{incident_id}/runbook", response_model=IncidentRunbookMatchResponse)
async def get_incident_runbook(incident_id: int):
    db: Session = SessionLocal()

    incident = db.query(Incident).filter(Incident.id == incident_id).first()

    db.close()

    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    return retrieve_runbook_for_incident(incident)


@router.get("/{incident_id}/coach", response_model=IncidentCoachResponse)
async def get_incident_coach(incident_id: int):
    db: Session = SessionLocal()

    incident = db.query(Incident).filter(Incident.id == incident_id).first()

    db.close()

    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    return coach_incident(incident)


@router.get("/{incident_id}/workflow", response_model=IncidentWorkflowResponse)
async def get_incident_workflow(incident_id: int):
    db: Session = SessionLocal()

    incident = db.query(Incident).filter(Incident.id == incident_id).first()

    db.close()

    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    return build_incident_workflow(incident)


@router.get("/{incident_id}/postmortem", response_model=IncidentPostmortemResponse)
async def get_incident_postmortem(incident_id: int):
    db: Session = SessionLocal()

    incident = db.query(Incident).filter(Incident.id == incident_id).first()

    db.close()

    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    return generate_postmortem(incident)


@router.post("/generate", response_model=IncidentResponse)
async def generate_synthetic_incident():
    db: Session = SessionLocal()

    generated = generate_incident()

    incident = Incident(
        title=generated["title"],
        severity=generated["severity"],
        status=generated["status"],
        logs=generated["logs"],
        metrics=generated["metrics"]
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    publish_incident_created(incident)

    db.close()

    return incident


@router.post("/simulate", response_model=list[IncidentResponse])
async def simulate_incidents(payload: IncidentSimulationRequest):
    db: Session = SessionLocal()
    incidents = []

    for _ in range(payload.count):
        generated = generate_incident(
            service=payload.service,
            scenario=payload.scenario,
            severity=payload.severity,
        )

        incident = Incident(
            title=generated["title"],
            severity=generated["severity"],
            status=generated["status"],
            logs=generated["logs"],
            metrics=generated["metrics"]
        )

        db.add(incident)
        db.commit()
        db.refresh(incident)

        publish_incident_created(incident)
        incidents.append(incident)

    db.close()

    return incidents

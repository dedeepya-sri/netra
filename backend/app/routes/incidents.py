import asyncio

from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.incident import Incident

from app.schemas.incident import IncidentAnalysisResponse
from app.schemas.incident import IncidentCreate
from app.schemas.incident import IncidentEventResponse
from app.schemas.incident import IncidentResponse

from app.services.incident_analysis import analyze_incident
from app.services.incident_events import list_recent_incident_events
from app.services.incident_events import publish_incident_created
from app.services.incident_events import read_incident_events
from app.services.incident_generator import generate_incident

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
        logs=payload.logs
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


@router.post("/generate", response_model=IncidentResponse)
async def generate_synthetic_incident():
    db: Session = SessionLocal()

    generated = generate_incident()

    incident = Incident(
        title=generated["title"],
        severity=generated["severity"],
        status=generated["status"],
        logs=generated["logs"]
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    publish_incident_created(incident)

    db.close()

    return incident

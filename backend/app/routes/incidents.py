from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.incident import Incident

from app.schemas.incident import IncidentCreate
from app.schemas.incident import IncidentResponse

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
        status=payload.status
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    db.close()

    return incident


@router.get("/", response_model=list[IncidentResponse])
async def list_incidents():
    db: Session = SessionLocal()

    incidents = db.query(Incident).all()

    db.close()

    return incidents


@router.post("/generate", response_model=IncidentResponse)
async def generate_synthetic_incident():
    db: Session = SessionLocal()

    generated = generate_incident()

    incident = Incident(
        title=generated["title"],
        severity=generated["severity"],
        status=generated["status"]
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    db.close()

    return incident
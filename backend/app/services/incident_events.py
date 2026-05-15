from app.core.redis import redis_client
from app.models.incident import Incident

INCIDENT_EVENTS_STREAM = "incidents.events"


def publish_incident_created(incident: Incident) -> str:
    event_id = redis_client.xadd(
        INCIDENT_EVENTS_STREAM,
        {
            "event_type": "incident.created",
            "incident_id": str(incident.id),
            "title": incident.title,
            "severity": incident.severity,
            "status": incident.status,
            "created_at": incident.created_at.isoformat(),
        },
    )

    return str(event_id)

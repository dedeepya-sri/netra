from app.core.redis import redis_client
from app.models.incident import Incident
from app.schemas.incident import IncidentEventResponse

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


def list_recent_incident_events(limit: int = 10) -> list[IncidentEventResponse]:
    entries = redis_client.xrevrange(
        INCIDENT_EVENTS_STREAM,
        count=limit,
    )

    events = []

    for event_id, fields in entries:
        events.append(
            IncidentEventResponse(
                id=str(event_id),
                event_type=fields["event_type"],
                incident_id=int(fields["incident_id"]),
                title=fields["title"],
                severity=fields["severity"],
                status=fields["status"],
                created_at=fields["created_at"],
            )
        )

    return events

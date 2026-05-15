from app.core.redis import redis_client
from app.models.incident import Incident
from app.schemas.incident import IncidentEventResponse

INCIDENT_EVENTS_STREAM = "incidents.events"


def publish_incident_created(incident: Incident) -> str:
    return publish_incident_event("incident.created", incident)


def publish_incident_updated(incident: Incident) -> str:
    return publish_incident_event("incident.updated", incident)


def publish_incident_event(event_type: str, incident: Incident) -> str:
    try:
        event_id = redis_client.xadd(
            INCIDENT_EVENTS_STREAM,
            {
                "event_type": event_type,
                "incident_id": str(incident.id),
                "title": incident.title,
                "severity": incident.severity,
                "status": incident.status,
                "created_at": incident.created_at.isoformat(),
            },
        )
    except Exception:
        return ""

    return str(event_id)


def _build_incident_event_response(
    event_id: str,
    fields: dict[str, str],
) -> IncidentEventResponse:
    return IncidentEventResponse(
        id=str(event_id),
        event_type=fields["event_type"],
        incident_id=int(fields["incident_id"]),
        title=fields["title"],
        severity=fields["severity"],
        status=fields["status"],
        created_at=fields["created_at"],
    )


def list_recent_incident_events(limit: int = 10) -> list[IncidentEventResponse]:
    try:
        entries = redis_client.xrevrange(
            INCIDENT_EVENTS_STREAM,
            count=limit,
        )
    except Exception:
        return []

    events = []

    for event_id, fields in entries:
        events.append(_build_incident_event_response(event_id, fields))

    return events


def read_incident_events(
    last_event_id: str,
    block_ms: int = 5000,
    count: int = 10,
) -> tuple[str, list[IncidentEventResponse]]:
    try:
        streams = redis_client.xread(
            {INCIDENT_EVENTS_STREAM: last_event_id},
            block=block_ms,
            count=count,
        )
    except Exception:
        return last_event_id, []

    events = []
    next_event_id = last_event_id

    for _, entries in streams:
        for event_id, fields in entries:
            next_event_id = str(event_id)
            events.append(_build_incident_event_response(event_id, fields))

    return next_event_id, events

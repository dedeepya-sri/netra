from app.models.incident import Incident
from app.schemas.incident import ServiceHealthResponse
from app.services.incident_generator import SERVICES


SERVICE_OWNERS = {
    "payment-service": "Payments",
    "auth-service": "Identity",
    "notification-service": "Messaging",
    "gateway-service": "Platform",
    "search-service": "Discovery",
}

SEVERITY_RANK = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "critical": 4,
}


def _service_name_from_title(title: str) -> str:
    return title.split()[0]


def _health_from_incidents(active_incidents: list[Incident]) -> str:
    if any(incident.severity == "critical" for incident in active_incidents):
        return "critical"
    if any(incident.severity in {"high", "medium"} for incident in active_incidents):
        return "degraded"
    if active_incidents:
        return "watch"

    return "healthy"


def summarize_service_health(
    incidents: list[Incident],
) -> list[ServiceHealthResponse]:
    active_incidents = [
        incident for incident in incidents if incident.status != "resolved"
    ]

    service_health = []

    for service_name in SERVICES:
        service_incidents = [
            incident
            for incident in active_incidents
            if _service_name_from_title(incident.title) == service_name
        ]
        latest_incident = max(
            service_incidents,
            key=lambda incident: incident.created_at,
            default=None,
        )
        highest_severity = max(
            (incident.severity for incident in service_incidents),
            key=lambda severity: SEVERITY_RANK.get(severity, 0),
            default=None,
        )
        metrics = latest_incident.metrics if latest_incident else {}

        service_health.append(
            ServiceHealthResponse(
                name=service_name,
                owner=SERVICE_OWNERS.get(service_name, "Engineering"),
                health=_health_from_incidents(service_incidents),
                active_incidents=len(service_incidents),
                latest_severity=highest_severity,
                latency_ms=metrics.get("latency_ms"),
                error_rate_percent=metrics.get("error_rate_percent"),
            )
        )

    return service_health

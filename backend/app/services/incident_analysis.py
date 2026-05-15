from app.models.incident import Incident
from app.schemas.incident import IncidentAnalysisResponse


def analyze_incident(incident: Incident) -> IncidentAnalysisResponse:
    log_lines = [
        line.strip()
        for line in incident.logs.splitlines()
        if line.strip()
    ]

    signals = log_lines[:5]
    lower_logs = incident.logs.lower()

    probable_cause = "Service degradation detected from correlated log signals"
    recommended_actions = [
        "Review recent deployments for the affected service",
        "Check service health, error rate, and latency dashboards",
        "Keep the incident open until recovery is confirmed",
    ]

    if "postgres" in lower_logs or "database" in lower_logs:
        probable_cause = "Database connectivity or primary node instability"
        recommended_actions.insert(
            0,
            "Inspect Postgres primary node health and connection pool saturation",
        )
    elif "redis" in lower_logs or "cache" in lower_logs:
        probable_cause = "Cache pressure or Redis dependency degradation"
        recommended_actions.insert(
            0,
            "Inspect Redis memory, latency, and cache hit ratio",
        )
    elif "deployment" in lower_logs or "health check" in lower_logs:
        probable_cause = "Failed deployment or unhealthy release candidate"
        recommended_actions.insert(
            0,
            "Compare the latest deployment with the last known healthy release",
        )
    elif "memory" in lower_logs:
        probable_cause = "Memory pressure on one or more service instances"
        recommended_actions.insert(
            0,
            "Inspect pod memory usage and restart count for the affected service",
        )
    elif "crash loop" in lower_logs:
        probable_cause = "Container crash loop in the serving path"
        recommended_actions.insert(
            0,
            "Inspect pod events and container termination reasons",
        )

    impact = (
        f"{incident.severity.capitalize()} severity incident affecting "
        f"{incident.title.split()[0]} with status {incident.status}."
    )

    summary = (
        f"{incident.title} is currently {incident.status}. "
        f"Netra found {len(log_lines)} relevant log signals."
    )

    return IncidentAnalysisResponse(
        incident_id=incident.id,
        summary=summary,
        probable_cause=probable_cause,
        impact=impact,
        signals=signals,
        recommended_actions=recommended_actions,
    )

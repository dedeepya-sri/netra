from app.models.incident import Incident
from app.schemas.incident import IncidentAnalysisResponse
from app.schemas.incident import IncidentCoachResponse
from app.schemas.incident import IncidentPostmortemResponse


SEVERITY_BASE_RISK = {
    "low": 20,
    "medium": 40,
    "high": 65,
    "critical": 85,
}


def _calculate_risk_score(severity: str, metrics: dict[str, float]) -> int:
    score = SEVERITY_BASE_RISK.get(severity, 35)

    latency_ms = metrics.get("latency_ms", 0)
    error_rate_percent = metrics.get("error_rate_percent", 0)
    cpu_percent = metrics.get("cpu_percent", 0)
    memory_percent = metrics.get("memory_percent", 0)

    if latency_ms >= 1000:
        score += 8
    if error_rate_percent >= 10:
        score += 12
    if cpu_percent >= 90:
        score += 6
    if memory_percent >= 90:
        score += 6

    return min(score, 100)


def _priority_from_risk_score(risk_score: int) -> str:
    if risk_score >= 90:
        return "P0"
    if risk_score >= 70:
        return "P1"
    if risk_score >= 45:
        return "P2"

    return "P3"


def analyze_incident(incident: Incident) -> IncidentAnalysisResponse:
    log_lines = [
        line.strip()
        for line in incident.logs.splitlines()
        if line.strip()
    ]

    signals = log_lines[:5]
    lower_logs = incident.logs.lower()
    metrics = incident.metrics or {}
    risk_score = _calculate_risk_score(incident.severity, metrics)
    priority = _priority_from_risk_score(risk_score)

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

    if metrics:
        impact = (
            f"{impact} Current telemetry shows "
            f"{metrics.get('latency_ms', 0)}ms latency, "
            f"{metrics.get('error_rate_percent', 0)} percent error rate, "
            f"{metrics.get('cpu_percent', 0)} percent CPU, and "
            f"{metrics.get('memory_percent', 0)} percent memory usage."
        )

    summary = (
        f"{incident.title} is currently {incident.status}. "
        f"Netra found {len(log_lines)} relevant log signals "
        f"and {len(metrics)} metric signals."
    )

    return IncidentAnalysisResponse(
        incident_id=incident.id,
        summary=summary,
        probable_cause=probable_cause,
        impact=impact,
        risk_score=risk_score,
        priority=priority,
        signals=signals,
        recommended_actions=recommended_actions,
    )


def generate_postmortem(incident: Incident) -> IncidentPostmortemResponse:
    analysis = analyze_incident(incident)

    return IncidentPostmortemResponse(
        incident_id=incident.id,
        title=f"Postmortem: {incident.title}",
        executive_summary=(
            f"{analysis.summary} The incident was classified as "
            f"{incident.severity} severity and remains {incident.status}."
        ),
        customer_impact=analysis.impact,
        root_cause=analysis.probable_cause,
        detection=(
            "Netra detected the incident from synthetic infrastructure "
            "signals and correlated service logs."
        ),
        resolution=(
            "Resolution is pending operator confirmation. Recommended "
            "mitigation steps should be executed and validated against "
            "service health metrics."
        ),
        follow_up_actions=analysis.recommended_actions,
    )


def coach_incident(incident: Incident) -> IncidentCoachResponse:
    analysis = analyze_incident(incident)
    service_name = incident.title.split()[0]

    first_steps = [
        "Tell the incident lead what you are checking before making changes",
        *analysis.recommended_actions[:3],
        "Post findings in the incident channel with timestamps and screenshots",
    ]

    questions_to_ask = [
        f"Did {service_name} have a deploy, config change, or traffic spike recently?",
        "Which customer flows are affected right now?",
        "What metric needs to return to normal before we call this recovered?",
    ]

    return IncidentCoachResponse(
        incident_id=incident.id,
        plain_summary=(
            f"{service_name} is showing signs of a "
            f"{incident.severity} incident. Netra thinks the most likely "
            f"cause is: {analysis.probable_cause.lower()}."
        ),
        why_it_matters=(
            "This matters because engineers need one clear starting point, "
            "one owner for each check, and a shared view of customer impact."
        ),
        first_steps=first_steps,
        escalation_message=(
            f"Please help with incident #{incident.id}: {incident.title}. "
            f"Priority {analysis.priority}, risk {analysis.risk_score}/100. "
            f"Suspected cause: {analysis.probable_cause}."
        ),
        questions_to_ask=questions_to_ask,
    )

from collections import Counter

from app.models.incident import Incident
from app.schemas.incident import MetricSummaryResponse
from app.schemas.incident import ObservabilitySummaryResponse
from app.schemas.incident import ServiceIncidentSummaryResponse
from app.services.incident_generator import SERVICES


METRIC_KEYS = [
    "latency_ms",
    "error_rate_percent",
    "cpu_percent",
    "memory_percent",
]


def _service_name_from_title(title: str) -> str:
    return title.split()[0]


def _average_metric(incidents: list[Incident], metric_key: str) -> float:
    values = [
        incident.metrics.get(metric_key, 0)
        for incident in incidents
        if incident.metrics and metric_key in incident.metrics
    ]

    if not values:
        return 0

    return round(sum(values) / len(values), 2)


def summarize_observability(
    incidents: list[Incident],
) -> ObservabilitySummaryResponse:
    status_counts = Counter(incident.status for incident in incidents)
    severity_counts = Counter(incident.severity for incident in incidents)
    active_incidents = [
        incident for incident in incidents if incident.status != "resolved"
    ]
    service_incidents = []

    for service in SERVICES:
        service_matches = [
            incident
            for incident in incidents
            if _service_name_from_title(incident.title) == service
        ]
        active_matches = [
            incident for incident in service_matches if incident.status != "resolved"
        ]

        service_incidents.append(
            ServiceIncidentSummaryResponse(
                service=service,
                incident_count=len(service_matches),
                active_count=len(active_matches),
            )
        )

    resolved_count = status_counts.get("resolved", 0)
    mttr_minutes_estimate = max(12, 45 - (resolved_count * 3))

    return ObservabilitySummaryResponse(
        total_incidents=len(incidents),
        active_incidents=len(active_incidents),
        resolved_incidents=resolved_count,
        mttr_minutes_estimate=mttr_minutes_estimate,
        status_counts=dict(status_counts),
        severity_counts=dict(severity_counts),
        average_metrics=MetricSummaryResponse(
            latency_ms=_average_metric(incidents, "latency_ms"),
            error_rate_percent=_average_metric(incidents, "error_rate_percent"),
            cpu_percent=_average_metric(incidents, "cpu_percent"),
            memory_percent=_average_metric(incidents, "memory_percent"),
        ),
        service_incidents=service_incidents,
    )

import random

SERVICES = [
    "payment-service",
    "auth-service",
    "notification-service",
    "gateway-service",
    "search-service"
]

INCIDENT_TYPES = [
    "latency spike",
    "database outage",
    "memory leak",
    "high error rate",
    "deployment failure"
]

SEVERITIES = [
    "low",
    "medium",
    "high",
    "critical"
]

LOG_TEMPLATES = [
    "ERROR connection timeout to postgres primary node",
    "WARNING upstream service response exceeded 5000ms",
    "CRITICAL failed deployment health check",
    "ERROR redis cache miss ratio exceeded threshold",
    "WARNING memory usage exceeded 92 percent",
    "ERROR Kubernetes pod crash loop detected"
]

SCENARIO_LOGS = {
    "latency spike": [
        "WARNING upstream service response exceeded 5000ms",
        "WARNING p95 latency crossed service objective",
        "ERROR request queue depth exceeded threshold",
    ],
    "database outage": [
        "ERROR connection timeout to postgres primary node",
        "ERROR database connection pool exhausted",
        "CRITICAL write path unavailable due to database outage",
    ],
    "memory leak": [
        "WARNING memory usage exceeded 92 percent",
        "ERROR process heap growth exceeded baseline",
        "ERROR Kubernetes pod crash loop detected",
    ],
    "high error rate": [
        "ERROR upstream dependency returned elevated 5xx responses",
        "ERROR high error rate crossed alert threshold",
        "WARNING retry volume increased across service boundary",
    ],
    "deployment failure": [
        "CRITICAL failed deployment health check",
        "ERROR Kubernetes pod crash loop detected",
        "WARNING readiness probe failed after rollout",
    ],
    "redis pressure": [
        "ERROR redis cache miss ratio exceeded threshold",
        "WARNING redis memory fragmentation increased",
        "WARNING cache read latency exceeded baseline",
    ],
}


def generate_logs(scenario: str | None = None):
    logs = []
    templates = SCENARIO_LOGS.get(scenario or "", LOG_TEMPLATES)

    for _ in range(5):
        logs.append(random.choice(templates))

    return "\n".join(logs)


def generate_metrics(severity: str, scenario: str | None = None):
    severity_multiplier = {
        "low": 1,
        "medium": 1.35,
        "high": 1.75,
        "critical": 2.25,
    }[severity]
    scenario = scenario or ""

    metrics = {
        "cpu_percent": round(
            min(random.uniform(45, 82) * severity_multiplier, 99),
            2,
        ),
        "memory_percent": round(
            min(random.uniform(55, 88) * severity_multiplier, 99),
            2,
        ),
        "latency_ms": round(random.uniform(180, 850) * severity_multiplier, 2),
        "error_rate_percent": round(
            min(random.uniform(0.8, 8.5) * severity_multiplier, 35),
            2,
        ),
    }

    if scenario == "latency spike":
        metrics["latency_ms"] = round(metrics["latency_ms"] * 1.65, 2)
    elif scenario == "database outage":
        metrics["latency_ms"] = round(metrics["latency_ms"] * 1.45, 2)
        metrics["error_rate_percent"] = round(
            min(metrics["error_rate_percent"] * 1.7, 45),
            2,
        )
    elif scenario == "memory leak":
        metrics["memory_percent"] = round(min(metrics["memory_percent"] * 1.3, 99), 2)
    elif scenario == "high error rate":
        metrics["error_rate_percent"] = round(
            min(metrics["error_rate_percent"] * 2.2, 55),
            2,
        )
    elif scenario == "redis pressure":
        metrics["latency_ms"] = round(metrics["latency_ms"] * 1.25, 2)

    return metrics


def generate_incident(
    service: str | None = None,
    scenario: str | None = None,
    severity: str | None = None,
):
    service = service if service in SERVICES else random.choice(SERVICES)

    allowed_scenarios = [*INCIDENT_TYPES, "redis pressure"]
    incident_type = (
        scenario if scenario in allowed_scenarios else random.choice(INCIDENT_TYPES)
    )

    severity = severity if severity in SEVERITIES else random.choice(SEVERITIES)

    title = f"{service} {incident_type}"

    logs = generate_logs(incident_type)

    metrics = generate_metrics(severity, incident_type)

    return {
        "title": title,
        "severity": severity,
        "status": "open",
        "logs": logs,
        "metrics": metrics
    }

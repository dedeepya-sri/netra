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


def generate_logs():
    logs = []

    for _ in range(5):
        logs.append(random.choice(LOG_TEMPLATES))

    return "\n".join(logs)


def generate_incident():
    service = random.choice(SERVICES)

    incident_type = random.choice(INCIDENT_TYPES)

    severity = random.choice(SEVERITIES)

    title = f"{service} {incident_type}"

    logs = generate_logs()

    return {
        "title": title,
        "severity": severity,
        "status": "open",
        "logs": logs
    }
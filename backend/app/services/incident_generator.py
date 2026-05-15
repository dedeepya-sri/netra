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


def generate_incident():
    service = random.choice(SERVICES)

    incident_type = random.choice(INCIDENT_TYPES)

    severity = random.choice(SEVERITIES)

    title = f"{service} {incident_type}"

    return {
        "title": title,
        "severity": severity,
        "status": "open"
    }
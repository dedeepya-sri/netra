from app.models.incident import Incident
from app.schemas.incident import IncidentRunbookMatchResponse
from app.schemas.incident import RunbookResponse


RUNBOOKS = [
    RunbookResponse(
        id="postgres-primary-instability",
        title="Postgres primary instability",
        service="payment-service",
        summary=(
            "Use this when requests timeout against Postgres, connection pools "
            "saturate, or the primary database node looks unhealthy."
        ),
        symptoms=[
            "connection timeout to postgres primary node",
            "database outage",
            "elevated checkout or write latency",
        ],
        checks=[
            "Check database primary CPU, memory, disk, and replication lag",
            "Inspect app connection pool saturation and timeout rate",
            "Compare current slow queries with the last healthy baseline",
        ],
        mitigations=[
            "Reduce write pressure with feature flags or queue backpressure",
            "Restart exhausted app workers only after pool pressure is confirmed",
            "Escalate to database owner before failover",
        ],
        escalation="Page the database owner and the service on-call.",
    ),
    RunbookResponse(
        id="redis-cache-pressure",
        title="Redis cache pressure",
        service="gateway-service",
        summary=(
            "Use this when Redis latency, memory, or cache miss ratio causes "
            "dependency pressure across services."
        ),
        symptoms=[
            "redis cache miss ratio exceeded threshold",
            "cache pressure",
            "dependency latency from cache reads",
        ],
        checks=[
            "Check Redis memory fragmentation and eviction rate",
            "Inspect cache hit ratio by key namespace",
            "Find the largest or fastest-growing key families",
        ],
        mitigations=[
            "Temporarily increase TTL for hot safe-to-cache keys",
            "Disable non-critical cache-warming jobs",
            "Scale read replicas if cache read latency remains high",
        ],
        escalation="Page platform cache owner if memory or latency keeps rising.",
    ),
    RunbookResponse(
        id="deployment-health-check-failure",
        title="Deployment health check failure",
        service="gateway-service",
        summary=(
            "Use this when a rollout fails health checks, increases errors, "
            "or causes crash loops shortly after deployment."
        ),
        symptoms=[
            "failed deployment health check",
            "deployment failure",
            "kubernetes pod crash loop detected",
        ],
        checks=[
            "Compare the new deployment SHA with the last healthy release",
            "Inspect pod events, readiness probes, and container exit reasons",
            "Check whether errors started after the rollout window",
        ],
        mitigations=[
            "Roll back to the last known healthy release",
            "Pause progressive rollout until error rate stabilizes",
            "Keep one engineer watching logs during rollback",
        ],
        escalation="Pull in release owner and service on-call immediately.",
    ),
    RunbookResponse(
        id="memory-pressure",
        title="Service memory pressure",
        service="search-service",
        summary=(
            "Use this when a service has high memory, restarts, or slow "
            "responses caused by memory pressure."
        ),
        symptoms=[
            "memory usage exceeded 92 percent",
            "memory leak",
            "pod restart count increasing",
        ],
        checks=[
            "Check memory usage by pod and recent restart count",
            "Compare heap growth with traffic and job activity",
            "Inspect recent code paths that load large payloads",
        ],
        mitigations=[
            "Scale replicas to reduce immediate user impact",
            "Restart only the worst affected pods while watching error rate",
            "Disable memory-heavy background jobs if safe",
        ],
        escalation="Ask the service owner to inspect heap or profile data.",
    ),
    RunbookResponse(
        id="high-error-rate",
        title="High service error rate",
        service="auth-service",
        summary=(
            "Use this when a user-facing service crosses the error budget "
            "threshold or returns elevated 5xx responses."
        ),
        symptoms=[
            "high error rate",
            "upstream service response exceeded 5000ms",
            "latency spike",
        ],
        checks=[
            "Break down errors by endpoint, status code, and dependency",
            "Check whether latency and error rate moved together",
            "Inspect the top recent logs for a repeated exception",
        ],
        mitigations=[
            "Enable graceful degradation for non-critical dependencies",
            "Throttle the most expensive request path",
            "Escalate if customer login, payment, or search flows are blocked",
        ],
        escalation="Page the owning service on-call and incident commander.",
    ),
]


def list_runbooks() -> list[RunbookResponse]:
    return RUNBOOKS


def retrieve_runbook_for_incident(
    incident: Incident,
) -> IncidentRunbookMatchResponse:
    query = f"{incident.title} {incident.logs}".lower()
    ranked_matches = []

    for runbook in RUNBOOKS:
        terms = [runbook.service, *runbook.symptoms, runbook.title]
        matched_terms = [
            term for term in terms if term.lower() in query
        ]
        score = len(matched_terms)

        if runbook.service in incident.title:
            score += 2

        ranked_matches.append((score, matched_terms, runbook))

    score, matched_terms, runbook = max(
        ranked_matches,
        key=lambda match: match[0],
    )
    confidence = min(0.35 + (score * 0.15), 0.95)

    return IncidentRunbookMatchResponse(
        incident_id=incident.id,
        query=query,
        matched_runbook=runbook,
        confidence=round(confidence, 2),
        matched_terms=matched_terms,
        suggested_order=[
            "Confirm customer impact and assign an owner",
            *runbook.checks,
            *runbook.mitigations[:2],
            runbook.escalation,
        ],
    )

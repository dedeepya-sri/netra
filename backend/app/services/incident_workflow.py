from app.models.incident import Incident
from app.schemas.incident import AgentTaskResponse
from app.schemas.incident import IncidentWorkflowResponse
from app.services.incident_analysis import analyze_incident
from app.services.runbook_retrieval import retrieve_runbook_for_incident


def build_incident_workflow(incident: Incident) -> IncidentWorkflowResponse:
    analysis = analyze_incident(incident)
    runbook_match = retrieve_runbook_for_incident(incident)
    service_name = incident.title.split()[0]

    agents = [
        AgentTaskResponse(
            agent="triage-agent",
            role="Incident commander assistant",
            goal="Stabilize coordination and keep the response focused",
            tasks=[
                "Confirm severity, affected service, and customer impact",
                "Assign owners for infrastructure, application, and communications",
                "Keep a running timeline of every decision and mitigation",
            ],
            handoff_to="diagnostic-agent",
            expected_output="Incident brief with owner map and impact statement",
            status="ready",
        ),
        AgentTaskResponse(
            agent="diagnostic-agent",
            role="Signal correlation specialist",
            goal="Find the most likely cause from logs, metrics, and runbooks",
            tasks=[
                f"Use {runbook_match.matched_runbook.title} as the response guide",
                *analysis.recommended_actions[:3],
                "Separate confirmed facts from hypotheses before mitigation",
            ],
            handoff_to="remediation-agent",
            expected_output="Ranked cause hypothesis with supporting evidence",
            status="ready",
        ),
        AgentTaskResponse(
            agent="remediation-agent",
            role="Mitigation planner",
            goal="Choose the lowest-risk action that improves service health",
            tasks=[
                *runbook_match.matched_runbook.mitigations[:3],
                "Verify each action against latency, error rate, CPU, and memory",
            ],
            handoff_to="comms-agent",
            expected_output="Mitigation decision and validation result",
            status="waiting_for_diagnostics",
        ),
        AgentTaskResponse(
            agent="comms-agent",
            role="Stakeholder communications",
            goal="Keep employees, interns, and stakeholders aligned",
            tasks=[
                "Post a concise status update every 15 minutes while active",
                "Call out customer impact, current owner, and next checkpoint",
                "Avoid declaring recovery until ready-to-resolve checks pass",
            ],
            handoff_to="postmortem-agent",
            expected_output="Status update and escalation message",
            status="ready",
        ),
        AgentTaskResponse(
            agent="postmortem-agent",
            role="Learning and follow-up owner",
            goal="Capture durable learning after recovery",
            tasks=[
                "Draft summary, root cause, detection, resolution, and follow-ups",
                "Link actions to the runbook and observed telemetry",
                "Identify one prevention item and one detection improvement",
            ],
            handoff_to="incident-commander",
            expected_output="Postmortem draft with follow-up actions",
            status="waiting_for_resolution",
        ),
    ]

    timeline = [
        "0-5 min: confirm impact, priority, and owners",
        "5-15 min: collect evidence and match runbook",
        "15-30 min: apply safest mitigation and monitor telemetry",
        "30+ min: communicate status, validate recovery, and write follow-ups",
    ]

    return IncidentWorkflowResponse(
        incident_id=incident.id,
        workflow_name=f"{service_name} incident response workflow",
        priority=analysis.priority,
        summary=(
            f"Coordinate {len(agents)} agents for {incident.title}. "
            f"Primary hypothesis: {analysis.probable_cause}."
        ),
        agents=agents,
        timeline=timeline,
        ready_to_resolve_checks=[
            "Error rate has returned to normal for two consecutive checks",
            "Latency is back within the service objective",
            "No new critical log pattern is appearing",
            "Incident commander and service owner agree recovery is stable",
        ],
        incident_commander_brief=(
            f"{incident.title} is {analysis.priority} with risk "
            f"{analysis.risk_score}/100. Start with "
            f"{runbook_match.matched_runbook.title}, assign owners, and "
            "validate every mitigation against live telemetry."
        ),
    )

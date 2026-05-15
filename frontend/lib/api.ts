const BACKEND_URL = "http://127.0.0.1:8000";
export const INCIDENT_EVENTS_WS_URL = "ws://127.0.0.1:8000/incidents/ws";

export type Incident = {
  id: number;
  title: string;
  severity: string;
  status: string;
  logs: string;
  metrics: Record<string, number>;
  created_at: string;
};

export type IncidentEvent = {
  id: string;
  event_type: string;
  incident_id: number;
  title: string;
  severity: string;
  status: string;
  created_at: string;
};

export type IncidentAnalysis = {
  incident_id: number;
  summary: string;
  probable_cause: string;
  impact: string;
  risk_score: number;
  priority: string;
  signals: string[];
  recommended_actions: string[];
};

export type IncidentPostmortem = {
  incident_id: number;
  title: string;
  executive_summary: string;
  customer_impact: string;
  root_cause: string;
  detection: string;
  resolution: string;
  follow_up_actions: string[];
};

export type IncidentCoach = {
  incident_id: number;
  plain_summary: string;
  why_it_matters: string;
  first_steps: string[];
  escalation_message: string;
  questions_to_ask: string[];
};

export type ServiceHealth = {
  name: string;
  owner: string;
  health: string;
  active_incidents: number;
  latest_severity: string | null;
  latency_ms: number | null;
  error_rate_percent: number | null;
};

export type Runbook = {
  id: string;
  title: string;
  service: string;
  summary: string;
  symptoms: string[];
  checks: string[];
  mitigations: string[];
  escalation: string;
};

export type IncidentRunbookMatch = {
  incident_id: number;
  query: string;
  matched_runbook: Runbook;
  confidence: number;
  matched_terms: string[];
  suggested_order: string[];
};

export type AgentTask = {
  agent: string;
  role: string;
  goal: string;
  tasks: string[];
  handoff_to: string;
  expected_output: string;
  status: string;
};

export type IncidentWorkflow = {
  incident_id: number;
  workflow_name: string;
  priority: string;
  summary: string;
  agents: AgentTask[];
  timeline: string[];
  ready_to_resolve_checks: string[];
  incident_commander_brief: string;
};

export type ObservabilitySummary = {
  total_incidents: number;
  active_incidents: number;
  resolved_incidents: number;
  mttr_minutes_estimate: number;
  status_counts: Record<string, number>;
  severity_counts: Record<string, number>;
  average_metrics: {
    latency_ms: number;
    error_rate_percent: number;
    cpu_percent: number;
    memory_percent: number;
  };
  service_incidents: {
    service: string;
    incident_count: number;
    active_count: number;
  }[];
};

export type IncidentSimulationRequest = {
  service?: string;
  scenario?: string;
  severity?: string;
  count: number;
};

export async function getBackendHealth() {
  const response = await fetch(`${BACKEND_URL}/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch backend health");
  }

  return response.json();
}

export async function getIncidents(): Promise<Incident[]> {
  const response = await fetch(`${BACKEND_URL}/incidents/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch incidents");
  }

  return response.json();
}

export async function generateIncident(): Promise<Incident> {
  const response = await fetch(`${BACKEND_URL}/incidents/generate`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to generate incident");
  }

  return response.json();
}

export async function simulateIncidents(
  payload: IncidentSimulationRequest,
): Promise<Incident[]> {
  const response = await fetch(`${BACKEND_URL}/incidents/simulate`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to simulate incidents");
  }

  return response.json();
}

export async function updateIncidentStatus(
  incidentId: number,
  status: string,
): Promise<Incident> {
  const response = await fetch(`${BACKEND_URL}/incidents/${incidentId}/status`, {
    body: JSON.stringify({ status }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Failed to update incident status");
  }

  return response.json();
}

export async function getRecentIncidentEvents(
  limit = 5,
): Promise<IncidentEvent[]> {
  const response = await fetch(
    `${BACKEND_URL}/incidents/events/recent?limit=${limit}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch incident events");
  }

  return response.json();
}

export async function getServiceHealth(): Promise<ServiceHealth[]> {
  const response = await fetch(`${BACKEND_URL}/incidents/services/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch service health");
  }

  return response.json();
}

export async function getRunbooks(): Promise<Runbook[]> {
  const response = await fetch(`${BACKEND_URL}/incidents/runbooks`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch runbooks");
  }

  return response.json();
}

export async function getObservabilitySummary(): Promise<ObservabilitySummary> {
  const response = await fetch(`${BACKEND_URL}/incidents/observability`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch observability summary");
  }

  return response.json();
}

export async function getIncidentRunbook(
  incidentId: number,
): Promise<IncidentRunbookMatch> {
  const response = await fetch(
    `${BACKEND_URL}/incidents/${incidentId}/runbook`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch incident runbook");
  }

  return response.json();
}

export async function getIncidentWorkflow(
  incidentId: number,
): Promise<IncidentWorkflow> {
  const response = await fetch(
    `${BACKEND_URL}/incidents/${incidentId}/workflow`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch incident workflow");
  }

  return response.json();
}

export async function analyzeIncident(
  incidentId: number,
): Promise<IncidentAnalysis> {
  const response = await fetch(`${BACKEND_URL}/incidents/${incidentId}/analysis`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to analyze incident");
  }

  return response.json();
}

export async function generatePostmortem(
  incidentId: number,
): Promise<IncidentPostmortem> {
  const response = await fetch(
    `${BACKEND_URL}/incidents/${incidentId}/postmortem`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to generate postmortem");
  }

  return response.json();
}

export async function coachIncident(
  incidentId: number,
): Promise<IncidentCoach> {
  const response = await fetch(`${BACKEND_URL}/incidents/${incidentId}/coach`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to coach incident");
  }

  return response.json();
}

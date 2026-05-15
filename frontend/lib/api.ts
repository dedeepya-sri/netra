const PUBLIC_BACKEND_URL =
  normalizeBackendUrl(
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000",
  );

const INTERNAL_BACKEND_URL =
  normalizeBackendUrl(
    process.env.BACKEND_URL_INTERNAL ?? PUBLIC_BACKEND_URL,
  );

const USE_INTERNAL_BACKEND =
  process.env.NETRA_DOCKER === "true";

const BACKEND_URL =
  typeof window === "undefined" && USE_INTERNAL_BACKEND
    ? INTERNAL_BACKEND_URL
    : PUBLIC_BACKEND_URL;

const SHOULD_FALL_BACK_TO_PUBLIC_BACKEND =
  typeof window === "undefined" &&
  USE_INTERNAL_BACKEND &&
  INTERNAL_BACKEND_URL !== PUBLIC_BACKEND_URL;

const FETCH_TIMEOUT_MS = 30000;

function normalizeBackendUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export const INCIDENT_EVENTS_WS_URL =
  `${PUBLIC_BACKEND_URL.replace(/^http/, "ws")}/incidents/ws`;

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
  timeline: string[];
  contributing_factors: string[];
  prevention_items: string[];
  lessons_learned: string[];
  owners: string[];
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

const EMPTY_INCIDENT_ANALYSIS: IncidentAnalysis = {
  incident_id: 0,
  summary: "Analysis is unavailable while the backend is offline.",
  probable_cause: "Unknown",
  impact: "Unknown",
  risk_score: 0,
  priority: "unknown",
  signals: [],
  recommended_actions: [],
};

const EMPTY_RUNBOOK: Runbook = {
  id: "unavailable",
  title: "Runbook unavailable",
  service: "unknown",
  summary: "Runbook matching is unavailable while the backend is offline.",
  symptoms: [],
  checks: [],
  mitigations: [],
  escalation: "Backend unavailable",
};

const EMPTY_INCIDENT_RUNBOOK: IncidentRunbookMatch = {
  incident_id: 0,
  query: "",
  matched_runbook: EMPTY_RUNBOOK,
  confidence: 0,
  matched_terms: [],
  suggested_order: [],
};

const EMPTY_INCIDENT_WORKFLOW: IncidentWorkflow = {
  incident_id: 0,
  workflow_name: "Workflow unavailable",
  priority: "unknown",
  summary: "Workflow generation is unavailable while the backend is offline.",
  agents: [],
  timeline: [],
  ready_to_resolve_checks: [],
  incident_commander_brief: "",
};

const EMPTY_INCIDENT_POSTMORTEM: IncidentPostmortem = {
  incident_id: 0,
  title: "Postmortem unavailable",
  executive_summary: "Postmortem generation is unavailable while the backend is offline.",
  customer_impact: "Unknown",
  root_cause: "Unknown",
  detection: "Unknown",
  resolution: "Unknown",
  timeline: [],
  contributing_factors: [],
  prevention_items: [],
  lessons_learned: [],
  owners: [],
  follow_up_actions: [],
};

const EMPTY_INCIDENT_COACH: IncidentCoach = {
  incident_id: 0,
  plain_summary: "Responder coaching is unavailable while the backend is offline.",
  why_it_matters: "",
  first_steps: [],
  escalation_message: "",
  questions_to_ask: [],
};

async function fetchBackend(
  path: string,
  init?: RequestInit,
) {
  const mergedInit: RequestInit = {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    ...init,
  };

  try {
    const url = `${BACKEND_URL}${path}`;

    return await fetch(url, mergedInit);
  } catch (error) {
    if (!SHOULD_FALL_BACK_TO_PUBLIC_BACKEND) {
      throw error;
    }

    try {
      return await fetch(
        `${PUBLIC_BACKEND_URL}${path}`,
        mergedInit,
      );
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
}

async function backendJson<T>(
  path: string,
  fallback: T,
  init?: RequestInit,
): Promise<T> {
  try {
    const response = await fetchBackend(path, init);

    return safeJson(response, fallback);
  } catch {
    console.warn(`Using backend fallback for ${path}`);

    return fallback;
  }
}

async function safeJson<T>(
  response: Response,
  fallback: T,
): Promise<T> {
  try {
    if (!response.ok) {
      return fallback;
    }

    return await response.json();
  } catch {
    return fallback;
  }
}

export async function getBackendHealth() {
  return backendJson("/health", {
    status: "offline",
  });
}

export async function getIncidents(): Promise<Incident[]> {
  return backendJson("/incidents/", []);
}

export async function generateIncident(): Promise<Incident> {
  return backendJson(
    "/incidents/generate",
    {} as Incident,
    {
      method: "POST",
    },
  );
}

export async function simulateIncidents(
  payload: IncidentSimulationRequest,
): Promise<Incident[]> {
  return backendJson(
    "/incidents/simulate",
    [],
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function updateIncidentStatus(
  incidentId: number,
  status: string,
): Promise<Incident> {
  return backendJson(
    `/incidents/${incidentId}/status`,
    {} as Incident,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );
}

export async function getRecentIncidentEvents(
  limit = 5,
): Promise<IncidentEvent[]> {
  return backendJson(
    `/incidents/events/recent?limit=${limit}`,
    [],
  );
}

export async function getServiceHealth(): Promise<ServiceHealth[]> {
  return backendJson(
    "/incidents/services/health",
    [],
  );
}

export async function getRunbooks(): Promise<Runbook[]> {
  return backendJson(
    "/incidents/runbooks",
    [],
  );
}

export async function getObservabilitySummary(): Promise<ObservabilitySummary> {
  return backendJson("/incidents/observability", {
    total_incidents: 0,
    active_incidents: 0,
    resolved_incidents: 0,
    mttr_minutes_estimate: 0,
    status_counts: {},
    severity_counts: {},
    average_metrics: {
      latency_ms: 0,
      error_rate_percent: 0,
      cpu_percent: 0,
      memory_percent: 0,
    },
    service_incidents: [],
  });
}

export async function getIncidentRunbook(
  incidentId: number,
): Promise<IncidentRunbookMatch> {
  return backendJson(
    `/incidents/${incidentId}/runbook`,
    {
      ...EMPTY_INCIDENT_RUNBOOK,
      incident_id: incidentId,
    },
  );
}

export async function getIncidentWorkflow(
  incidentId: number,
): Promise<IncidentWorkflow> {
  return backendJson(
    `/incidents/${incidentId}/workflow`,
    {
      ...EMPTY_INCIDENT_WORKFLOW,
      incident_id: incidentId,
    },
  );
}

export async function analyzeIncident(
  incidentId: number,
): Promise<IncidentAnalysis> {
  return backendJson(
    `/incidents/${incidentId}/analysis`,
    {
      ...EMPTY_INCIDENT_ANALYSIS,
      incident_id: incidentId,
    },
  );
}

export async function generatePostmortem(
  incidentId: number,
): Promise<IncidentPostmortem> {
  return backendJson(
    `/incidents/${incidentId}/postmortem`,
    {
      ...EMPTY_INCIDENT_POSTMORTEM,
      incident_id: incidentId,
    },
  );
}

export async function coachIncident(
  incidentId: number,
): Promise<IncidentCoach> {
  return backendJson(
    `/incidents/${incidentId}/coach`,
    {
      ...EMPTY_INCIDENT_COACH,
      incident_id: incidentId,
    },
  );
}

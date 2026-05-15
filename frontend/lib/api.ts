const BACKEND_URL = "http://127.0.0.1:8000";
export const INCIDENT_EVENTS_WS_URL = "ws://127.0.0.1:8000/incidents/ws";

export type Incident = {
  id: number;
  title: string;
  severity: string;
  status: string;
  logs: string;
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

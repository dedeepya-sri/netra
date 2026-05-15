import {
  getBackendHealth,
  getIncidents,
  getRecentIncidentEvents,
  getServiceHealth,
} from "@/lib/api";

import { Dashboard } from "./dashboard";

export default async function HomePage() {
  const [healthResult, incidentsResult, eventsResult, serviceHealthResult] =
    await Promise.allSettled([
      getBackendHealth(),
      getIncidents(),
      getRecentIncidentEvents(5),
      getServiceHealth(),
    ]);

  const health =
    healthResult.status === "fulfilled"
      ? healthResult.value
      : { status: "offline" };

  const incidents =
    incidentsResult.status === "fulfilled" ? incidentsResult.value : [];

  const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];

  const serviceHealth =
    serviceHealthResult.status === "fulfilled"
      ? serviceHealthResult.value
      : [];

  const initialError =
    healthResult.status === "rejected"
      ? "Backend is offline. Start the FastAPI service on port 8000."
      : null;

  return (
    <Dashboard
      initialEvents={events}
      initialError={initialError}
      initialHealth={health}
      initialIncidents={incidents}
      initialServiceHealth={serviceHealth}
    />
  );
}

import {
  getBackendHealth,
  getIncidents,
  getObservabilitySummary,
  getRecentIncidentEvents,
  getRunbooks,
  getServiceHealth,
} from "@/lib/api";

import { Dashboard } from "./dashboard";

export default async function HomePage() {
  const [
    healthResult,
    incidentsResult,
    eventsResult,
    serviceHealthResult,
    runbooksResult,
    observabilityResult,
  ] = await Promise.allSettled([
    getBackendHealth(),
    getIncidents(),
    getRecentIncidentEvents(5),
    getServiceHealth(),
    getRunbooks(),
    getObservabilitySummary(),
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

  const runbooks =
    runbooksResult.status === "fulfilled" ? runbooksResult.value : [];

  const observability =
    observabilityResult.status === "fulfilled"
      ? observabilityResult.value
      : null;

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
      initialObservability={observability}
      initialRunbooks={runbooks}
      initialServiceHealth={serviceHealth}
    />
  );
}

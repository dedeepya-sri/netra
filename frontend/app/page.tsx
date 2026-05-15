import {
  getBackendHealth,
  getIncidents,
  getRecentIncidentEvents,
} from "@/lib/api";

import { Dashboard } from "./dashboard";

export default async function HomePage() {
  const [health, incidents, events] = await Promise.all([
    getBackendHealth(),
    getIncidents(),
    getRecentIncidentEvents(5),
  ]);

  return (
    <Dashboard
      initialEvents={events}
      initialHealth={health}
      initialIncidents={incidents}
    />
  );
}

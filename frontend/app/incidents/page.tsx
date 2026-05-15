export const dynamic = "force-dynamic";

import {
  getIncidents,
  getObservabilitySummary,
  getRecentIncidentEvents,
} from "@/lib/api";

import { formatTimestamp } from "@/lib/format";
import { CreateIncidentButton } from "@/components/incidents/incident-actions";
import { IncidentTable } from "@/components/incidents/incident-table";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";

export default async function IncidentsPage() {
  let incidents = [];
  let observability = {
    status_counts: {
      open: 0,
      investigating: 0,
      resolved: 0,
    },
  };
  let events = [];

  try {
    const result = await Promise.all([
      getIncidents(),
      getObservabilitySummary(),
      getRecentIncidentEvents(8),
    ]);

    incidents = result[0] || [];
    observability = result[1] || observability;
    events = result[2] || [];
  } catch {
    incidents = [];
    events = [];
  }

  const openCount = observability.status_counts.open ?? 0;
  const investigatingCount = observability.status_counts.investigating ?? 0;
  const resolvedCount = observability.status_counts.resolved ?? 0;

  return (
    <>
      <PageHeader
        actions={<CreateIncidentButton />}
        description="Incident queue, status mix, and recent event stream."
        title="Incidents"
      />

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Open" value={openCount} detail="Needs ownership" />
        <MetricCard
          label="Investigating"
          value={investigatingCount}
          detail="Active triage"
        />
        <MetricCard label="Resolved" value={resolvedCount} detail="Closed out" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <IncidentTable incidents={incidents} />

        <aside className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold">Timeline</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {events.length > 0 ? (
              events.map((event) => (
                <div className="px-4 py-3" key={event.id}>
                  <p className="text-sm font-medium">{event.event_type}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {event.title}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    incident #{event.incident_id} -{" "}
                    {formatTimestamp(event.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-slate-500">
                No recent events
              </p>
            )}
          </div>
        </aside>
      </section>
    </>
  );
}
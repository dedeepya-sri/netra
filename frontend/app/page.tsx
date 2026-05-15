import Link from "next/link";

import {
  getBackendHealth,
  getIncidents,
  getObservabilitySummary,
  getRecentIncidentEvents,
  getServiceHealth,
} from "@/lib/api";
import { formatTimestamp } from "@/lib/format";
import { IncidentTable } from "@/components/incidents/incident-table";
import { CreateIncidentButton } from "@/components/incidents/incident-actions";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { HealthBadge } from "@/components/ui/status-badge";

export default async function OverviewPage() {
  const [healthResult, incidentsResult, eventsResult, servicesResult, obsResult] =
    await Promise.allSettled([
      getBackendHealth(),
      getIncidents(),
      getRecentIncidentEvents(5),
      getServiceHealth(),
      getObservabilitySummary(),
    ]);

  const health =
    healthResult.status === "fulfilled" ? healthResult.value.status : "offline";
  const incidents =
    incidentsResult.status === "fulfilled" ? incidentsResult.value : [];
  const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];
  const services = servicesResult.status === "fulfilled" ? servicesResult.value : [];
  const observability = obsResult.status === "fulfilled" ? obsResult.value : null;
  const activeIncidents = incidents.filter(
    (incident) => incident.status !== "resolved",
  );
  const criticalServices = services.filter(
    (service) => service.health === "critical",
  );

  return (
    <>
      <PageHeader
        actions={<CreateIncidentButton />}
        description="High-level operational state for incidents, services, telemetry, and event flow."
        title="Overview"
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Backend" value={health} detail="FastAPI service" />
        <MetricCard
          label="Active incidents"
          value={activeIncidents.length}
          detail={`${incidents.length} total tracked`}
        />
        <MetricCard
          label="Critical services"
          value={criticalServices.length}
          detail={`${services.length} services monitored`}
        />
        <MetricCard
          label="Estimated MTTR"
          value={`${observability?.mttr_minutes_estimate ?? 0}m`}
          detail="Synthetic estimate"
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Active incidents</h2>
            <Link className="text-sm text-sky-700 hover:text-sky-900" href="/incidents">
              View all
            </Link>
          </div>
          <IncidentTable incidents={activeIncidents.slice(0, 8)} />
        </div>

        <div className="space-y-5">
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold">Service health</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {services.map((service) => (
                <Link
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                  href={`/services?service=${service.name}`}
                  key={service.name}
                >
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-slate-500">{service.owner}</p>
                  </div>
                  <HealthBadge health={service.health} />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold">Recent stream events</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {events.map((event) => (
                <div className="px-4 py-3" key={event.id}>
                  <p className="text-sm font-medium">{event.event_type}</p>
                  <p className="text-sm text-slate-600">{event.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatTimestamp(event.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}

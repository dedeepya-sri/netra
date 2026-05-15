import { getObservabilitySummary, getServiceHealth } from "@/lib/api";
import { formatMetric } from "@/lib/format";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";

export default async function MetricsPage() {
  const [observability, services] = await Promise.all([
    getObservabilitySummary(),
    getServiceHealth(),
  ]);

  return (
    <>
      <PageHeader
        description="Operational telemetry rollups from generated incidents and service health."
        title="Metrics"
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Average latency"
          value={formatMetric(observability.average_metrics.latency_ms, "ms")}
          detail="Across incidents"
        />
        <MetricCard
          label="Average error rate"
          value={formatMetric(
            observability.average_metrics.error_rate_percent,
            "%",
          )}
          detail="Across incidents"
        />
        <MetricCard
          label="Average CPU"
          value={formatMetric(observability.average_metrics.cpu_percent, "%")}
          detail="Synthetic host signal"
        />
        <MetricCard
          label="Average memory"
          value={formatMetric(observability.average_metrics.memory_percent, "%")}
          detail="Synthetic host signal"
        />
      </section>

      <section className="mt-5 rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold">Service telemetry</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {services.map((service) => (
            <div
              className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_140px_140px_140px]"
              key={service.name}
            >
              <p className="font-medium">{service.name}</p>
              <p className="text-slate-600">
                {formatMetric(service.latency_ms, "ms")} latency
              </p>
              <p className="text-slate-600">
                {formatMetric(service.error_rate_percent, "%")} errors
              </p>
              <p className="text-slate-600">
                {service.active_incidents} active incidents
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

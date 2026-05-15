export const dynamic = "force-dynamic";

import { getObservabilitySummary, getServiceHealth } from "@/lib/api";
import { formatMetric } from "@/lib/format";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";

export default async function MetricsPage() {
  let observability = {
    average_metrics: {
      latency_ms: 0,
      error_rate_percent: 0,
      cpu_percent: 0,
      memory_percent: 0,
    },
  };

  let services = [];

  try {
    const result = await Promise.all([
      getObservabilitySummary(),
      getServiceHealth(),
    ]);

    observability = result[0];
    services = result[1];
  } catch {
    services = [];
  }

  return (
    <>
      <PageHeader
        description="Operational telemetry rollups from generated incidents and service health."
        title="Metrics"
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Average latency"
          value={formatMetric(
            observability.average_metrics.latency_ms,
            "ms",
          )}
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
          value={formatMetric(
            observability.average_metrics.cpu_percent,
            "%",
          )}
          detail="Synthetic host signal"
        />

        <MetricCard
          label="Average memory"
          value={formatMetric(
            observability.average_metrics.memory_percent,
            "%",
          )}
          detail="Synthetic host signal"
        />
      </section>

      <section className="mt-5 rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold">
            Service telemetry
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {services.length > 0 ? (
            services.map((service) => (
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
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No telemetry available.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
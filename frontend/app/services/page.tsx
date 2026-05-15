export const dynamic = "force-dynamic";

import Link from "next/link";

import { getServiceHealth } from "@/lib/api";
import { formatMetric } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { HealthBadge } from "@/components/ui/status-badge";

export default async function ServicesPage() {
  let services = [];

  try {
    services = await getServiceHealth();
  } catch {
    services = [];
  }

  return (
    <>
      <PageHeader
        description="Service ownership, active incidents, health state, and current telemetry."
        title="Services"
      />

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Health</th>
              <th className="px-4 py-3 font-medium">Active incidents</th>
              <th className="px-4 py-3 font-medium">Latency</th>
              <th className="px-4 py-3 font-medium">Error rate</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {services.length > 0 ? (
              services.map((service) => (
                <tr className="hover:bg-slate-50" key={service.name}>
                  <td className="px-4 py-3">
                    <Link
                      className="font-medium text-slate-950 hover:text-sky-700"
                      href={`/services?service=${service.name}`}
                    >
                      {service.name}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {service.owner}
                  </td>

                  <td className="px-4 py-3">
                    <HealthBadge health={service.health} />
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {service.active_incidents}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {formatMetric(service.latency_ms, "ms")}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {formatMetric(service.error_rate_percent, "%")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-4 py-8 text-center text-slate-500"
                  colSpan={6}
                >
                  No services available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
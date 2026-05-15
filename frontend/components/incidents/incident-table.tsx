import Link from "next/link";

import type { Incident } from "@/lib/api";
import { formatMetric, formatTimestamp } from "@/lib/format";
import {
  IncidentStatusBadge,
  SeverityBadge,
} from "@/components/ui/status-badge";

export function IncidentTable({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Incident</th>
            <th className="px-4 py-3 font-medium">Severity</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Latency</th>
            <th className="px-4 py-3 font-medium">Errors</th>
            <th className="px-4 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {incidents.map((incident) => (
            <tr className="hover:bg-slate-50" key={incident.id}>
              <td className="px-4 py-3">
                <Link
                  className="font-medium text-slate-950 hover:text-sky-700"
                  href={`/incidents/${incident.id}`}
                >
                  #{incident.id} {incident.title}
                </Link>
              </td>
              <td className="px-4 py-3">
                <SeverityBadge severity={incident.severity} />
              </td>
              <td className="px-4 py-3">
                <IncidentStatusBadge status={incident.status} />
              </td>
              <td className="px-4 py-3 text-slate-600">
                {formatMetric(incident.metrics.latency_ms, "ms")}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {formatMetric(incident.metrics.error_rate_percent, "%")}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {formatTimestamp(incident.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {incidents.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-slate-500">
          No incidents found.
        </div>
      ) : null}
    </div>
  );
}

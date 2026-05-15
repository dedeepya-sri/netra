export const dynamic = "force-dynamic";

import Link from "next/link";

import { getIncidents } from "@/lib/api";
import { formatTimestamp, serviceNameFromTitle } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import {
  IncidentStatusBadge,
  SeverityBadge,
} from "@/components/ui/status-badge";

export default async function DeploymentsPage() {
  let incidents = [];

  try {
    incidents = await getIncidents();
  } catch {
    incidents = [];
  }

  const deploymentEvents = incidents.filter((incident) =>
    `${incident.title} ${incident.logs}`
      .toLowerCase()
      .includes("deployment"),
  );

  return (
    <>
      <PageHeader
        description="Deployment-related incidents and rollout health signals."
        title="Deployments"
      />

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">
                Deployment signal
              </th>

              <th className="px-4 py-3 font-medium">
                Service
              </th>

              <th className="px-4 py-3 font-medium">
                Severity
              </th>

              <th className="px-4 py-3 font-medium">
                Status
              </th>

              <th className="px-4 py-3 font-medium">
                Detected
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {deploymentEvents.length > 0 ? (
              deploymentEvents.map((incident) => (
                <tr
                  className="hover:bg-slate-50"
                  key={incident.id}
                >
                  <td className="px-4 py-3">
                    <Link
                      className="font-medium text-slate-950 hover:text-sky-700"
                      href={`/incidents/${incident.id}`}
                    >
                      #{incident.id} {incident.title}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {serviceNameFromTitle(incident.title)}
                  </td>

                  <td className="px-4 py-3">
                    <SeverityBadge severity={incident.severity} />
                  </td>

                  <td className="px-4 py-3">
                    <IncidentStatusBadge status={incident.status} />
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    {formatTimestamp(incident.created_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm text-slate-500"
                  colSpan={5}
                >
                  No deployment-related incidents detected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
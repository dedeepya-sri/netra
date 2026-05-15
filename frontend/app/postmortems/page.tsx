import Link from "next/link";

import { generatePostmortem, getIncidents } from "@/lib/api";
import { formatTimestamp } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { IncidentStatusBadge, SeverityBadge } from "@/components/ui/status-badge";

export default async function PostmortemsPage() {
  const incidents = await getIncidents();
  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "resolved",
  );
  const postmortems = await Promise.all(
    resolvedIncidents.slice(0, 12).map(async (incident) => ({
      incident,
      postmortem: await generatePostmortem(incident.id),
    })),
  );

  return (
    <>
      <PageHeader
        description="Resolved incident reviews, owners, lessons, and follow-up work."
        title="Postmortems"
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {postmortems.map(({ incident, postmortem }) => (
          <Link
            className="rounded-md border border-slate-200 bg-white p-4 hover:border-slate-300 hover:bg-slate-50"
            href={`/incidents/${incident.id}`}
            key={incident.id}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-slate-950">{postmortem.title}</p>
              <SeverityBadge severity={incident.severity} />
              <IncidentStatusBadge status={incident.status} />
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {postmortem.executive_summary}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Created {formatTimestamp(incident.created_at)}
            </p>
          </Link>
        ))}
      </section>

      {postmortems.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No resolved incidents have postmortem drafts yet.
        </div>
      ) : null}
    </>
  );
}

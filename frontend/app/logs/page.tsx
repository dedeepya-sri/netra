export const dynamic = "force-dynamic";

import Link from "next/link";

import { type Incident, getIncidents } from "@/lib/api";
import { formatTimestamp } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { SeverityBadge } from "@/components/ui/status-badge";

export default async function LogsPage() {
  let incidents: Incident[] = [];

  try {
    incidents = await getIncidents();
  } catch {
    incidents = [];
  }

  const logEntries = incidents.flatMap((incident) =>
    incident.logs
      .split("\n")
      .filter(Boolean)
      .map((line, index) => ({
        id: `${incident.id}-${index}`,
        incident,
        line,
      })),
  );

  return (
    <>
      <PageHeader
        description="Consolidated incident log stream for triage and correlation."
        title="Live Logs"
      />

      <section className="rounded-md border border-slate-800 bg-slate-950">
        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-100">
            Log stream
          </h2>
        </div>

        <div className="max-h-[720px] overflow-auto">
          {logEntries.length > 0 ? (
            logEntries.map((entry) => (
              <div
                className="grid gap-3 border-b border-slate-900 px-4 py-2 font-mono text-xs text-slate-300 md:grid-cols-[150px_180px_90px_minmax(0,1fr)]"
                key={entry.id}
              >
                <span className="text-slate-500">
                  {formatTimestamp(entry.incident.created_at)}
                </span>

                <Link
                  className="text-sky-300 hover:text-sky-200"
                  href={`/incidents/${entry.incident.id}`}
                >
                  {entry.incident.title}
                </Link>

                <SeverityBadge severity={entry.incident.severity} />

                <span className="whitespace-pre-wrap">
                  {entry.line}
                </span>
              </div>
            ))
          ) : (
            <div className="p-6 text-sm text-slate-400">
              No logs available.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

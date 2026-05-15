export const dynamic = "force-dynamic";

import Link from "next/link";

import {
  type Incident,
  type IncidentAnalysis,
  analyzeIncident,
  getIncidents,
} from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import {
  IncidentStatusBadge,
  SeverityBadge,
  StatusBadge,
} from "@/components/ui/status-badge";

export default async function AIAnalysisPage() {
  let incidents: Incident[] = [];

  try {
    incidents = await getIncidents();
  } catch {
    incidents = [];
  }

  const focusIncident =
    incidents.find((incident) => incident.status !== "resolved") ?? incidents[0];

  let analysis: IncidentAnalysis | null = null;

  if (focusIncident) {
    try {
      analysis = await analyzeIncident(focusIncident.id);
    } catch {
      analysis = null;
    }
  }

  return (
    <>
      <PageHeader
        description="Focused analysis view for the highest-priority active incident."
        title="AI Analysis"
      />

      {focusIncident && analysis ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  className="text-base font-semibold hover:text-sky-700"
                  href={`/incidents/${focusIncident.id}`}
                >
                  #{focusIncident.id} {focusIncident.title}
                </Link>

                <SeverityBadge severity={focusIncident.severity} />

                <IncidentStatusBadge status={focusIncident.status} />

                <StatusBadge tone="accent">
                  {analysis.priority}
                </StatusBadge>
              </div>
            </div>

            <div className="space-y-5 p-4 text-sm text-slate-700">
              <p>{analysis.summary}</p>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Probable cause
                </p>

                <p className="mt-1 text-base font-medium text-slate-950">
                  {analysis.probable_cause}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Recommended actions
                </p>

                <ul className="mt-2 list-disc space-y-2 pl-5">
                  {analysis.recommended_actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold">Signals</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {analysis.signals.map((signal) => (
                <p
                  className="px-4 py-3 font-mono text-xs text-slate-700"
                  key={signal}
                >
                  {signal}
                </p>
              ))}
            </div>
          </aside>
        </section>
      ) : (
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No incidents available for analysis.
        </div>
      )}
    </>
  );
}

import { notFound } from "next/navigation";

import {
  analyzeIncident,
  coachIncident,
  generatePostmortem,
  getIncidentRunbook,
  getIncidentWorkflow,
  getIncidents,
} from "@/lib/api";
import { formatMetric, formatTimestamp } from "@/lib/format";
import { ResolveIncidentButton } from "@/components/incidents/incident-actions";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import {
  IncidentStatusBadge,
  SeverityBadge,
  StatusBadge,
} from "@/components/ui/status-badge";

export default async function IncidentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incidentId = Number(id);
  const incidents = await getIncidents();
  const incident = incidents.find((item) => item.id === incidentId);

  if (!incident) {
    notFound();
  }

  const [analysis, runbook, workflow, coach, postmortem] = await Promise.all([
    analyzeIncident(incident.id),
    getIncidentRunbook(incident.id),
    getIncidentWorkflow(incident.id),
    coachIncident(incident.id),
    generatePostmortem(incident.id),
  ]);

  return (
    <>
      <PageHeader
        actions={
          incident.status === "resolved" ? null : (
            <ResolveIncidentButton incidentId={incident.id} />
          )
        }
        description={`Created ${formatTimestamp(incident.created_at)}`}
        title={`#${incident.id} ${incident.title}`}
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Severity</p>
          <div className="mt-3">
            <SeverityBadge severity={incident.severity} />
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
          <div className="mt-3">
            <IncidentStatusBadge status={incident.status} />
          </div>
        </div>
        <MetricCard
          label="Risk"
          value={`${analysis.risk_score}/100`}
          detail={analysis.priority}
        />
        <MetricCard
          label="Error rate"
          value={formatMetric(incident.metrics.error_rate_percent, "%")}
          detail={`${formatMetric(incident.metrics.latency_ms, "ms")} latency`}
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold">AI analysis</h2>
            </div>
            <div className="space-y-4 p-4 text-sm text-slate-700">
              <p>{analysis.summary}</p>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Probable cause
                </p>
                <p className="mt-1 font-medium text-slate-950">
                  {analysis.probable_cause}
                </p>
              </div>
              <ul className="list-disc space-y-2 pl-5">
                {analysis.recommended_actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold">Incident timeline</h2>
            </div>
            <ol className="space-y-3 p-4 text-sm">
              {postmortem.timeline.map((item) => (
                <li className="border-l-2 border-slate-200 pl-3" key={item}>
                  {item}
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-md border border-slate-200 bg-slate-950">
            <div className="border-b border-slate-800 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-100">Logs</h2>
            </div>
            <pre className="max-h-[360px] overflow-auto p-4 text-xs leading-6 text-slate-200">
              {incident.logs}
            </pre>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold">Runbook match</h2>
            </div>
            <div className="space-y-3 p-4 text-sm">
              <p className="font-medium">{runbook.matched_runbook.title}</p>
              <p className="text-slate-600">{runbook.matched_runbook.summary}</p>
              <StatusBadge>
                {Math.round(runbook.confidence * 100)}% confidence
              </StatusBadge>
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold">Responder coach</h2>
            </div>
            <div className="space-y-3 p-4 text-sm text-slate-700">
              <p>{coach.plain_summary}</p>
              <ul className="list-disc space-y-2 pl-5">
                {coach.first_steps.slice(0, 4).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold">Agent workflow</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {workflow.agents.map((agent) => (
                <div className="px-4 py-3" key={agent.agent}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{agent.agent}</p>
                    <StatusBadge tone="accent">{agent.status}</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{agent.role}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </>
  );
}

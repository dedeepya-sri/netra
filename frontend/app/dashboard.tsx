"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  INCIDENT_EVENTS_WS_URL,
  analyzeIncident,
  coachIncident,
  generateIncident,
  generatePostmortem,
  getBackendHealth,
  getIncidents,
  getRecentIncidentEvents,
  getServiceHealth,
  updateIncidentStatus,
  type Incident,
  type IncidentAnalysis,
  type IncidentCoach,
  type IncidentEvent,
  type IncidentPostmortem,
  type ServiceHealth,
} from "@/lib/api";

type Health = {
  status: string;
};

type DashboardProps = {
  initialHealth: Health;
  initialIncidents: Incident[];
  initialEvents: IncidentEvent[];
  initialServiceHealth: ServiceHealth[];
  initialError: string | null;
};

const severityStyles: Record<string, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  critical: "bg-rose-50 text-rose-700 border-rose-200",
};

const healthStyles: Record<string, string> = {
  healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  watch: "bg-sky-50 text-sky-700 border-sky-200",
  degraded: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-rose-50 text-rose-700 border-rose-200",
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "UTC",
});

function formatTimestamp(timestamp: string) {
  return dateTimeFormatter.format(new Date(timestamp));
}

function formatMetric(value: number | undefined, suffix: string) {
  if (value === undefined) {
    return "n/a";
  }

  return `${value}${suffix}`;
}

export function Dashboard({
  initialHealth,
  initialIncidents,
  initialEvents,
  initialServiceHealth,
  initialError,
}: DashboardProps) {
  const [health, setHealth] = useState(initialHealth);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [events, setEvents] = useState(initialEvents);
  const [serviceHealth, setServiceHealth] = useState(initialServiceHealth);
  const [selectedIncidentId, setSelectedIncidentId] = useState(
    initialIncidents[0]?.id ?? null,
  );
  const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
  const [coach, setCoach] = useState<IncidentCoach | null>(null);
  const [postmortem, setPostmortem] = useState<IncidentPostmortem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCoaching, setIsCoaching] = useState(false);
  const [isGeneratingPostmortem, setIsGeneratingPostmortem] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const openIncidentCount = useMemo(
    () => incidents.filter((incident) => incident.status === "open").length,
    [incidents],
  );

  const investigatingIncidentCount = useMemo(
    () =>
      incidents.filter((incident) => incident.status === "investigating")
        .length,
    [incidents],
  );

  const selectedIncident = useMemo(
    () =>
      incidents.find((incident) => incident.id === selectedIncidentId) ??
      incidents[0] ??
      null,
    [incidents, selectedIncidentId],
  );

  const refreshDashboard = useCallback(async () => {
    const [healthData, incidentData, eventData, serviceHealthData] =
      await Promise.all([
      getBackendHealth(),
      getIncidents(),
      getRecentIncidentEvents(5),
      getServiceHealth(),
    ]);

    setHealth(healthData);
    setIncidents(incidentData);
    setEvents(eventData);
    setServiceHealth(serviceHealthData);
  }, []);

  async function handleGenerateIncident() {
    setIsGenerating(true);
    setError(null);

    try {
      await generateIncident();
      await refreshDashboard();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to generate incident",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleAnalyzeIncident() {
    if (!selectedIncident) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysisData = await analyzeIncident(selectedIncident.id);

      setAnalysis(analysisData);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to analyze incident",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleCoachIncident() {
    if (!selectedIncident) {
      return;
    }

    setIsCoaching(true);
    setError(null);

    try {
      const coachData = await coachIncident(selectedIncident.id);

      setCoach(coachData);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to coach incident",
      );
    } finally {
      setIsCoaching(false);
    }
  }

  async function handleGeneratePostmortem() {
    if (!selectedIncident) {
      return;
    }

    setIsGeneratingPostmortem(true);
    setError(null);

    try {
      const postmortemData = await generatePostmortem(selectedIncident.id);

      setPostmortem(postmortemData);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to generate postmortem",
      );
    } finally {
      setIsGeneratingPostmortem(false);
    }
  }

  async function handleResolveIncident() {
    if (!selectedIncident) {
      return;
    }

    setIsResolving(true);
    setError(null);

    try {
      await updateIncidentStatus(selectedIncident.id, "resolved");
      await refreshDashboard();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to resolve incident",
      );
    } finally {
      setIsResolving(false);
    }
  }

  useEffect(() => {
    const socket = new WebSocket(INCIDENT_EVENTS_WS_URL);

    socket.onmessage = (message) => {
      const event = JSON.parse(message.data) as IncidentEvent;

      if (
        event.event_type === "incident.created" ||
        event.event_type === "incident.updated"
      ) {
        refreshDashboard().catch((currentError) => {
          setError(
            currentError instanceof Error
              ? currentError.message
              : "Failed to refresh dashboard",
          );
        });
      }
    };

    socket.onerror = () => {
      setError("Live updates unavailable. Backend data is still accessible.");
    };

    return () => {
      socket.close();
    };
  }, [refreshDashboard]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-5">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">
              Netra incident desk
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Live incidents, synthetic signals, AI analysis, and postmortems.
            </p>
          </div>

          <button
            className="h-10 w-full rounded-md bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            disabled={isGenerating}
            onClick={handleGenerateIncident}
            type="button"
          >
            {isGenerating ? "Creating incident..." : "Create test incident"}
          </button>
        </header>

        {error ? (
          <section className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </section>
        ) : null}

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Backend status</p>
            <p className="mt-2 text-2xl font-semibold">{health.status}</p>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Open incidents</p>
            <p className="mt-2 text-2xl font-semibold">{openIncidentCount}</p>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">In investigation</p>
            <p className="mt-2 text-2xl font-semibold">
              {investigatingIncidentCount}
            </p>
          </div>
        </section>

        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold">Service health</h2>
          </div>

          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
            {serviceHealth.map((service) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50 p-3"
                key={service.name}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {service.owner}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-medium ${
                      healthStyles[service.health] ??
                      "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {service.health}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <p className="text-slate-500">Active</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {service.active_incidents}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Severity</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {service.latest_severity ?? "none"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Latency</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatMetric(service.latency_ms ?? undefined, "ms")}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Errors</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatMetric(
                        service.error_rate_percent ?? undefined,
                        "%",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {serviceHealth.length === 0 ? (
              <div className="text-sm text-slate-500">
                Service health is unavailable until the backend is running.
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold">Incident queue</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Incident</th>
                    <th className="px-4 py-3 font-medium">Severity</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr
                      className={`border-t border-slate-100 ${
                        selectedIncident?.id === incident.id
                          ? "bg-cyan-50"
                          : "hover:bg-slate-50"
                      }`}
                      key={incident.id}
                    >
                      <td className="px-4 py-3 text-slate-500">
                        <button
                          className="font-medium text-cyan-700 hover:text-cyan-900"
                          onClick={() => {
                            setSelectedIncidentId(incident.id);
                            setAnalysis(null);
                            setCoach(null);
                            setPostmortem(null);
                          }}
                          type="button"
                        >
                          {incident.id}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {incident.title}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-medium ${
                            severityStyles[incident.severity] ??
                            "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {incident.status}
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
                  No incidents yet.
                </div>
              ) : null}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <section className="rounded-md border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold">Selected incident</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  <button
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedIncident || isAnalyzing}
                    onClick={handleAnalyzeIncident}
                    type="button"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze"}
                  </button>
                  <button
                    className="h-9 rounded-md border border-violet-200 bg-violet-50 px-3 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedIncident || isCoaching}
                    onClick={handleCoachIncident}
                    type="button"
                  >
                    {isCoaching ? "Coaching..." : "Coach"}
                  </button>
                  <button
                    className="h-9 rounded-md border border-cyan-200 bg-cyan-50 px-3 text-xs font-medium text-cyan-700 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedIncident || isGeneratingPostmortem}
                    onClick={handleGeneratePostmortem}
                    type="button"
                  >
                    {isGeneratingPostmortem ? "Writing..." : "Write report"}
                  </button>
                  <button
                    className="h-9 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      !selectedIncident ||
                      selectedIncident.status === "resolved" ||
                      isResolving
                    }
                    onClick={handleResolveIncident}
                    type="button"
                  >
                    {isResolving ? "Resolving..." : "Resolve"}
                  </button>
                </div>
              </div>

              {selectedIncident ? (
                <div className="space-y-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      #{selectedIncident.id} {selectedIncident.title}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                        <p className="text-slate-500">CPU</p>
                        <p className="mt-1 text-slate-900">
                          {formatMetric(
                            selectedIncident.metrics.cpu_percent,
                            "%",
                          )}
                        </p>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                        <p className="text-slate-500">Memory</p>
                        <p className="mt-1 text-slate-900">
                          {formatMetric(
                            selectedIncident.metrics.memory_percent,
                            "%",
                          )}
                        </p>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                        <p className="text-slate-500">Latency</p>
                        <p className="mt-1 text-slate-900">
                          {formatMetric(
                            selectedIncident.metrics.latency_ms,
                            "ms",
                          )}
                        </p>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                        <p className="text-slate-500">Error rate</p>
                        <p className="mt-1 text-slate-900">
                          {formatMetric(
                            selectedIncident.metrics.error_rate_percent,
                            "%",
                          )}
                        </p>
                      </div>
                    </div>
                    <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-950 p-3 text-xs leading-5 text-slate-200">
                      {selectedIncident.logs}
                    </pre>
                  </div>

                  {coach ? (
                    <div className="space-y-3 rounded-md border border-violet-200 bg-violet-50 p-3 text-sm">
                      <div>
                        <p className="text-xs uppercase text-violet-600">
                          AI coach
                        </p>
                        <p className="mt-1 text-violet-950">
                          {coach.plain_summary}
                        </p>
                        <p className="mt-2 text-violet-800">
                          {coach.why_it_matters}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-violet-600">
                          First steps
                        </p>
                        <ul className="mt-2 list-disc space-y-2 pl-4 text-violet-900">
                          {coach.first_steps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-violet-600">
                          Escalation message
                        </p>
                        <p className="mt-1 text-violet-900">
                          {coach.escalation_message}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                      Use Coach for plain-language guidance for interns and
                      new responders.
                    </div>
                  )}

                  {analysis ? (
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs uppercase text-slate-500">
                          AI analysis
                        </p>
                        <p className="mt-1 text-slate-700">
                          {analysis.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                          <p className="text-xs uppercase text-slate-500">
                            Priority
                          </p>
                          <p className="mt-1 text-slate-900">
                            {analysis.priority}
                          </p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                          <p className="text-xs uppercase text-slate-500">
                            Risk score
                          </p>
                          <p className="mt-1 text-slate-900">
                            {analysis.risk_score}/100
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-slate-500">
                          Probable cause
                        </p>
                        <p className="mt-1 text-slate-700">
                          {analysis.probable_cause}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-slate-500">
                          Next actions
                        </p>
                        <ul className="mt-2 list-disc space-y-2 pl-4 text-slate-700">
                          {analysis.recommended_actions.map((action) => (
                            <li key={action}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                      Run analysis to see priority, cause, and next actions.
                    </div>
                  )}

                  {postmortem ? (
                    <div className="space-y-3 border-t border-slate-200 pt-4 text-sm">
                      <div>
                        <p className="text-xs uppercase text-slate-500">
                          {postmortem.title}
                        </p>
                        <p className="mt-1 text-slate-700">
                          {postmortem.executive_summary}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-slate-500">
                          Root cause
                        </p>
                        <p className="mt-1 text-slate-700">
                          {postmortem.root_cause}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-slate-500">
                          Resolution
                        </p>
                        <p className="mt-1 text-slate-700">
                          {postmortem.resolution}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                      Write a report after analysis or resolution.
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500">
                  No incident selected.
                </div>
              )}
            </section>

            <section className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold">Event stream</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {events.map((event) => (
                <div className="px-4 py-3" key={event.id}>
                  <p className="text-sm font-medium">{event.event_type}</p>
                  <p className="mt-1 text-sm text-slate-600">{event.title}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    incident #{event.incident_id} -{" "}
                    {formatTimestamp(event.created_at)}
                  </p>
                </div>
              ))}
              {events.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-500">
                  No stream events yet.
                </div>
              ) : null}
            </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

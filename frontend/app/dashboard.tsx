"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  INCIDENT_EVENTS_WS_URL,
  analyzeIncident,
  generateIncident,
  getBackendHealth,
  getIncidents,
  getRecentIncidentEvents,
  type Incident,
  type IncidentAnalysis,
  type IncidentEvent,
} from "@/lib/api";

type Health = {
  status: string;
};

type DashboardProps = {
  initialHealth: Health;
  initialIncidents: Incident[];
  initialEvents: IncidentEvent[];
  initialError: string | null;
};

const severityStyles: Record<string, string> = {
  low: "bg-emerald-950 text-emerald-300 border-emerald-800",
  medium: "bg-amber-950 text-amber-300 border-amber-800",
  high: "bg-orange-950 text-orange-300 border-orange-800",
  critical: "bg-rose-950 text-rose-300 border-rose-800",
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "UTC",
});

function formatTimestamp(timestamp: string) {
  return dateTimeFormatter.format(new Date(timestamp));
}

export function Dashboard({
  initialHealth,
  initialIncidents,
  initialEvents,
  initialError,
}: DashboardProps) {
  const [health, setHealth] = useState(initialHealth);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [events, setEvents] = useState(initialEvents);
  const [selectedIncidentId, setSelectedIncidentId] = useState(
    initialIncidents[0]?.id ?? null,
  );
  const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const openIncidentCount = useMemo(
    () => incidents.filter((incident) => incident.status === "open").length,
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
    const [healthData, incidentData, eventData] = await Promise.all([
      getBackendHealth(),
      getIncidents(),
      getRecentIncidentEvents(5),
    ]);

    setHealth(healthData);
    setIncidents(incidentData);
    setEvents(eventData);
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

  useEffect(() => {
    const socket = new WebSocket(INCIDENT_EVENTS_WS_URL);

    socket.onmessage = (message) => {
      const event = JSON.parse(message.data) as IncidentEvent;

      if (event.event_type === "incident.created") {
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
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">Netra</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Engineering intelligence console
            </p>
          </div>

          <button
            className="h-10 w-full border border-cyan-700 bg-cyan-950 px-4 text-sm font-medium text-cyan-100 transition hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            disabled={isGenerating}
            onClick={handleGenerateIncident}
            type="button"
          >
            {isGenerating ? "Generating..." : "Generate incident"}
          </button>
        </header>

        {error ? (
          <section className="border border-rose-800 bg-rose-950 px-4 py-3 text-sm text-rose-200">
            {error}
          </section>
        ) : null}

        <section className="grid gap-3 md:grid-cols-3">
          <div className="border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs uppercase text-zinc-500">Backend</p>
            <p className="mt-2 text-2xl font-semibold">{health.status}</p>
          </div>

          <div className="border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs uppercase text-zinc-500">Open incidents</p>
            <p className="mt-2 text-2xl font-semibold">{openIncidentCount}</p>
          </div>

          <div className="border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs uppercase text-zinc-500">Stream events</p>
            <p className="mt-2 text-2xl font-semibold">{events.length}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden border border-zinc-800 bg-zinc-950">
            <div className="border-b border-zinc-800 px-4 py-3">
              <h2 className="text-sm font-semibold">Incidents</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Severity</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr
                      className={`border-t border-zinc-800 ${
                        selectedIncident?.id === incident.id
                          ? "bg-zinc-900"
                          : ""
                      }`}
                      key={incident.id}
                    >
                      <td className="px-4 py-3 text-zinc-500">
                        <button
                          className="text-cyan-300 hover:text-cyan-200"
                          onClick={() => {
                            setSelectedIncidentId(incident.id);
                            setAnalysis(null);
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
                          className={`border px-2 py-1 text-xs ${
                            severityStyles[incident.severity] ??
                            "border-zinc-700 bg-zinc-900 text-zinc-300"
                          }`}
                        >
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {incident.status}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {formatTimestamp(incident.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <section className="border border-zinc-800 bg-zinc-950">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <h2 className="text-sm font-semibold">Incident analysis</h2>
                <button
                  className="h-8 border border-zinc-700 bg-zinc-900 px-3 text-xs text-zinc-100 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!selectedIncident || isAnalyzing}
                  onClick={handleAnalyzeIncident}
                  type="button"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </button>
              </div>

              {selectedIncident ? (
                <div className="space-y-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      #{selectedIncident.id} {selectedIncident.title}
                    </p>
                    <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap border border-zinc-800 bg-black p-3 text-xs leading-5 text-zinc-400">
                      {selectedIncident.logs}
                    </pre>
                  </div>

                  {analysis ? (
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs uppercase text-zinc-500">
                          Summary
                        </p>
                        <p className="mt-1 text-zinc-300">
                          {analysis.summary}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-zinc-500">
                          Probable cause
                        </p>
                        <p className="mt-1 text-zinc-300">
                          {analysis.probable_cause}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-zinc-500">
                          Recommended actions
                        </p>
                        <ul className="mt-2 space-y-2 text-zinc-300">
                          {analysis.recommended_actions.map((action) => (
                            <li key={action}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-zinc-500">
                  No incident selected.
                </div>
              )}
            </section>

            <section className="border border-zinc-800 bg-zinc-950">
            <div className="border-b border-zinc-800 px-4 py-3">
              <h2 className="text-sm font-semibold">Recent events</h2>
            </div>

            <div className="divide-y divide-zinc-800">
              {events.map((event) => (
                <div className="px-4 py-3" key={event.id}>
                  <p className="text-sm font-medium">{event.event_type}</p>
                  <p className="mt-1 text-sm text-zinc-400">{event.title}</p>
                  <p className="mt-2 text-xs text-zinc-600">
                    incident #{event.incident_id} &middot;{" "}
                    {formatTimestamp(event.created_at)}
                  </p>
                </div>
              ))}
            </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

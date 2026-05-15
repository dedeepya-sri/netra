import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

const settings = [
  ["Backend API", process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000"],
  ["Server API", process.env.BACKEND_URL_INTERNAL ?? "default"],
  ["Event stream", "Redis stream: incidents.events"],
  ["RAG store", "ChromaDB configured"],
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        description="Runtime endpoints and platform integration settings."
        title="Settings"
      />

      <section className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold">Environment</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {settings.map(([label, value]) => (
            <div
              className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[220px_minmax(0,1fr)]"
              key={label}
            >
              <p className="font-medium text-slate-700">{label}</p>
              <p className="font-mono text-xs text-slate-600">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold">Feature readiness</h2>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          <StatusBadge tone="healthy">Incidents online</StatusBadge>
          <StatusBadge tone="healthy">Redis events online</StatusBadge>
          <StatusBadge tone="info">RAG deterministic</StatusBadge>
          <StatusBadge tone="info">Agents simulated</StatusBadge>
        </div>
      </section>
    </>
  );
}

import type React from "react";

type BadgeTone =
  | "critical"
  | "warning"
  | "healthy"
  | "info"
  | "neutral"
  | "accent";

const toneStyles: Record<BadgeTone, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  accent: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded border px-2 text-xs font-medium ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const toneBySeverity: Record<string, BadgeTone> = {
    critical: "critical",
    high: "warning",
    low: "healthy",
    medium: "warning",
  };

  return (
    <StatusBadge tone={toneBySeverity[severity] ?? "neutral"}>
      {severity}
    </StatusBadge>
  );
}

export function IncidentStatusBadge({ status }: { status: string }) {
  const toneByStatus: Record<string, BadgeTone> = {
    investigating: "warning",
    open: "info",
    resolved: "healthy",
  };

  return (
    <StatusBadge tone={toneByStatus[status] ?? "neutral"}>{status}</StatusBadge>
  );
}

export function HealthBadge({ health }: { health: string }) {
  const toneByHealth: Record<string, BadgeTone> = {
    critical: "critical",
    degraded: "warning",
    healthy: "healthy",
    watch: "info",
  };

  return (
    <StatusBadge tone={toneByHealth[health] ?? "neutral"}>{health}</StatusBadge>
  );
}

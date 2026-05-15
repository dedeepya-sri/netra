"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { generateIncident, updateIncidentStatus } from "@/lib/api";

export function CreateIncidentButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);

    try {
      await generateIncident();
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      className="h-9 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoading}
      onClick={handleClick}
      type="button"
    >
      {isLoading ? "Creating..." : "Create incident"}
    </button>
  );
}

export function ResolveIncidentButton({ incidentId }: { incidentId: number }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);

    try {
      await updateIncidentStatus(incidentId, "resolved");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      className="h-9 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoading}
      onClick={handleClick}
      type="button"
    >
      {isLoading ? "Resolving..." : "Mark resolved"}
    </button>
  );
}

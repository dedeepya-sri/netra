import { getBackendHealth } from "@/lib/api";

export default async function HomePage() {
  const health = await getBackendHealth();

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="border border-zinc-800 p-10 rounded-xl">
        <h1 className="text-4xl font-bold mb-4">Netra</h1>

        <p className="text-zinc-400 mb-2">
          AI-native Engineering Intelligence Platform
        </p>

        <div className="mt-6">
          <p className="text-sm text-zinc-500 mb-1">
            Backend Health Status
          </p>

          <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-md">
            {health.status}
          </div>
        </div>
      </div>
    </main>
  );
}
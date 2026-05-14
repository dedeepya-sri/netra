const BACKEND_URL = "http://127.0.0.1:8000";

export async function getBackendHealth() {
  const response = await fetch(`${BACKEND_URL}/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch backend health");
  }

  return response.json();
}
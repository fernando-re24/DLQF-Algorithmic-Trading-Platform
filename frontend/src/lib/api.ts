/**
 * Thin wrapper around fetch that automatically injects the Supabase
 * JWT as `Authorization: Bearer <token>` on every request.
 *
 * Usage:
 *   const profile = await api.get<{ user_id: string; email: string }>("/me");
 *   const result  = await api.post<Submission>("/submit", payload);
 */
import { getAccessToken } from "./auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
};

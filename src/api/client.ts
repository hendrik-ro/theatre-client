// Thrown for every non-2xx API response. Carries the HTTP status so
// callers can branch on 401/403/404 without parsing the message.
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Same-origin fetch wrapper: cookies ride along in dev (Vite proxy) and
// in production (client served by the API server). JSON error bodies are
// unwrapped into ApiError; empty 204 bodies resolve to undefined.
export function request<T>(url: string, init?: RequestInit): Promise<T> {
  return requestOnce<T>(url, init, false);
}

// A 401 on these would loop: they answer for themselves, and the refresh
// endpoint itself must never trigger a refresh.
const AUTH_ENDPOINTS = [
  "/api/users/login",
  "/api/users/register",
  "/api/users/logout",
  "/api/users/refresh",
];

async function requestOnce<T>(
  url: string,
  init: RequestInit | undefined,
  isRetry: boolean,
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  // A 401 usually means the 15-minute access token expired. Call the
  // refresh endpoint once — it rotates the HTTP-only cookies server-side —
  // and replay the original request. Refresh failures fall through to the
  // normal error path.
  if (res.status === 401 && !isRetry && !AUTH_ENDPOINTS.includes(url)) {
    const refresh = await fetch("/api/users/refresh", { method: "POST" });
    if (refresh.ok) {
      return requestOnce<T>(url, init, true);
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body: unknown = await res.json();
      if (
        body !== null &&
        typeof body === "object" &&
        "message" in body &&
        typeof body.message === "string"
      ) {
        message = body.message;
      }
    } catch {
      // non-JSON error body, keep default message
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

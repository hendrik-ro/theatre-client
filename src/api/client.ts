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
export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

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

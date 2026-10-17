import { request } from "./client";
import type { AuthUser, LoginInput, RegisterInput } from "../types/user";

const BASE = "/api/users";

export function register(input: RegisterInput): Promise<void> {
  return request<void>(`${BASE}/register`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: LoginInput): Promise<void> {
  return request<void>(`${BASE}/login`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout(): Promise<void> {
  return request<void>(`${BASE}/logout`, { method: "POST" });
}

// Rotates the HTTP-only JWT cookies server-side; no body needed. The
// response carries the fresh pair back as Set-Cookie.
export function refreshToken(): Promise<void> {
  return request<void>(`${BASE}/refresh`, { method: "POST" });
}

// The source of truth for the current user; register and login establish
// the session server-side and this confirms it.
export function fetchMe(): Promise<AuthUser> {
  return request<AuthUser>(`${BASE}/me`);
}

// Self-service account deletion; only the session user's own id passes
// the server's requireAdminOrSelf guard.
export function deleteProfile(id: string): Promise<void> {
  return request<void>(`${BASE}/${id}`, { method: "DELETE" });
}

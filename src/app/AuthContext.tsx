import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../api/auth";
import type { AuthUser, LoginInput, RegisterInput } from "../types/user";

interface AuthContextValue {
  user: AuthUser | null;
  // False while the initial GET /me is in flight; guards wait for it so
  // a logged-in visitor is not flashed a login redirect on reload.
  ready: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    try {
      setUser(await fetchMe());
    } catch {
      // No session, a stale session, or the API being unreachable: all
      // fall back to guest mode. Protected pages surface real errors on
      // their next action.
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    // The rule cannot see that reload() only setStates after its await;
    // this is the sanctioned one-time external-system sync (fetch the
    // session on mount), not a derived-value effect.
    // eslint-disable-next-line react/set-state-in-effect
    void reload();
  }, [reload]);

  const login = useCallback(async (input: LoginInput) => {
    await loginRequest(input);
    setUser(await fetchMe());
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    await registerRequest(input);
    setUser(await fetchMe());
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout, reload }),
    [user, ready, login, register, logout, reload],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

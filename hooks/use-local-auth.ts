import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Local-only authentication hook for offline trading journal.
 * No server authentication required - all data stored locally.
 */
export function useLocalAuth() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    setUser(null);
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    // Auto-authenticate as local user
    setUser({
      id: "local-user",
      name: "Trader",
    });
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    error: null,
    isAuthenticated: true, // Always authenticated locally
    refresh: async () => {},
    logout,
  };
}

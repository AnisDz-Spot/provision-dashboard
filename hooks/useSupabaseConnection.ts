import { useEffect, useState } from "react";

export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await fetch("/api/user/supabase-keys");
        if (!res.ok) {
          setIsConnected(false);
          return;
        }
        const data = await res.json();
        setIsConnected(Boolean(data.connected));
      } catch {
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    }

    checkConnection();
  }, []);

  return { isConnected, loading };
}

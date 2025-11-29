"use client";

import { useEffect, useState } from "react";

export default function ConnectSupabasePage() {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [status, setStatus] = useState<null | string>(null);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Check connection status
    fetch("/api/user/supabase-keys")
      .then((r) => r.json())
      .then((j) => setConnected(Boolean(j.connected)))
      .catch(() => setConnected(false));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/user/supabase-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, anonKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("saved");
        setConnected(true);
      } else {
        setStatus(data.error || "error");
      }
    } catch (err) {
      setStatus(String(err));
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Connect Supabase (per-user)</h1>
      <p>
        This page allows a signed-in user to provide their own Supabase project
        credentials. Keys are encrypted on the server and stored for your user
        only.
      </p>

      <div style={{ marginTop: 16 }}>
        <strong>Status:</strong>{" "}
        {connected === null
          ? "checking..."
          : connected
          ? "connected"
          : "not connected"}
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 16, maxWidth: 700 }}>
        <div style={{ marginBottom: 8 }}>
          <label>
            Supabase URL
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            anon/public key
            <input
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="public-anon-key"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>
        </div>

        <button type="submit" style={{ padding: "8px 16px" }}>
          Save
        </button>

        <div style={{ marginTop: 12 }}>{status && <pre>{status}</pre>}</div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { signOut } from "@/lib/auth";
import { api } from "@/lib/api";

interface MeResponse {
  user_id: string;
  email: string;
  profile: Record<string, unknown> | null;
}

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setLoading(false);
    });

    // Reflect sign-in / sign-out changes in real time
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfile() {
    setError(null);
    try {
      const data = await api.get<MeResponse>("/me");
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function handleSignOut() {
    await signOut();
    setProfile(null);
  }

  if (loading) return <p>Loading…</p>;

  return (
    <main>
      <h1>DLQF Algorithmic Trading Platform</h1>

      {email ? (
        <>
          <p>Signed in as <strong>{email}</strong></p>
          <button onClick={handleSignOut} style={btnStyle}>Sign out</button>
          <hr />
          <button onClick={fetchProfile} style={btnStyle}>Call /me</button>
          {profile && (
            <pre style={{ background: "#f4f4f4", padding: "1rem", marginTop: "1rem" }}>
              {JSON.stringify(profile, null, 2)}
            </pre>
          )}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      ) : (
        <>
          <p>You are not signed in.</p>
          <Link href="/login" style={linkStyle}>Sign in</Link>
          {" · "}
          <Link href="/signup" style={linkStyle}>Create account</Link>
        </>
      )}
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  cursor: "pointer",
  marginRight: "0.5rem",
};

const linkStyle: React.CSSProperties = {
  color: "#0070f3",
};

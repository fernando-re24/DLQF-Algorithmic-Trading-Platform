"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </label>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p>
        No account? <Link href="/signup">Create one</Link>
      </p>
    </main>
  );
}

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  maxWidth: 360,
};

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: "0.25rem",
  padding: "0.5rem",
  fontSize: "1rem",
};

const btnStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  cursor: "pointer",
};

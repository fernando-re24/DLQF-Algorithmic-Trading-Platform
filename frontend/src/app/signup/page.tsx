"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await signUp(email, password);
      setMessage(
        "Account created! Check your email to confirm your address, then sign in."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Create account</h1>
      {message ? (
        <p style={{ color: "green" }}>{message}</p>
      ) : (
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
              minLength={6}
              style={inputStyle}
            />
          </label>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
      )}
      <p>
        Already have an account? <Link href="/login">Sign in</Link>
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

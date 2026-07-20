"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import Link from "next/link";

export function LoginForm({ message }: { message?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      if (signInError.message.toLowerCase().includes("email not confirmed")) {
        setError("Please verify your email before signing in.");
      } else {
        setError(signInError.message);
      }
      return;
    }

    window.location.href = "/vote";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message === "verify-email" && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Check your email and click the verification link before signing in.
        </p>
      )}
      {message === "check-email" && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Account created! Check your email to verify your address, then sign in.
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">
        Sign in
      </Button>
      <p className="text-center text-sm text-stone-600">
        No account?{" "}
        <Link href="/signup" className="font-medium text-emerald-800 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Button } from "./Button";

export function SubmitVotesButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (
      !confirm(
        "Submit your votes? You will not be able to change them after this."
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/votes/submit", { method: "POST" });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to submit votes");
      return;
    }

    window.location.href = "/vote/submitted";
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleSubmit} loading={loading} disabled={disabled}>
        Submit all votes
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

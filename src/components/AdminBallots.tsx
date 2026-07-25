"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";

type Nominee = {
  id: string;
  full_name: string;
  house: string;
};

type Position = { id: string; title: string };
type Award = { id: string; title: string };

type FinalVote = {
  user_id: string;
  nominee_id: string;
  position_id: string | null;
  award_id: string | null;
  submitted_at: string;
};

type Voter = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  votes_submitted_at: string | null;
};

export function AdminBallots({
  positions,
  awards,
  nominees,
  finalVotes,
  voters,
}: {
  positions: Position[];
  awards: Award[];
  nominees: Nominee[];
  finalVotes: FinalVote[];
  voters: Voter[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nomineeMap = new Map(nominees.map((n) => [n.id, n]));

  const submittedVoters = voters
    .filter((v) => v.votes_submitted_at)
    .sort(
      (a, b) =>
        new Date(b.votes_submitted_at!).getTime() -
        new Date(a.votes_submitted_at!).getTime()
    );

  function tallyFor(
    categoryId: string,
    kind: "position" | "award"
  ): Array<{ nominee: Nominee; count: number }> {
    const counts = new Map<string, number>();
    for (const vote of finalVotes) {
      const match =
        kind === "position"
          ? vote.position_id === categoryId
          : vote.award_id === categoryId;
      if (!match) continue;
      counts.set(vote.nominee_id, (counts.get(vote.nominee_id) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([nomineeId, count]) => ({
        nominee: nomineeMap.get(nomineeId) ?? {
          id: nomineeId,
          full_name: "Unknown nominee",
          house: "—",
        },
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  function votesForUser(userId: string) {
    return finalVotes.filter((v) => v.user_id === userId);
  }

  async function clearBallot(userId: string, label: string) {
    if (
      !confirm(
        `Clear ballot for ${label}? They will be able to vote again from scratch.`
      )
    ) {
      return;
    }

    setError(null);
    setLoadingId(userId);

    const res = await fetch("/api/admin/ballots/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json().catch(() => ({}));
    setLoadingId(null);

    if (!res.ok) {
      setError(data.error ?? "Failed to clear ballot");
      return;
    }

    router.refresh();
  }

  async function clearAllBallots() {
    if (
      !confirm(
        "Reset ALL submitted ballots? Every voter will be unlocked and can vote again. This cannot be undone."
      )
    ) {
      return;
    }

    if (
      !confirm(
        "Are you sure? This permanently deletes every submitted ballot record."
      )
    ) {
      return;
    }

    setError(null);
    setClearingAll(true);

    const res = await fetch("/api/admin/ballots/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    const data = await res.json().catch(() => ({}));
    setClearingAll(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to reset ballots");
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">Vote tallies</h2>
        <p className="mt-1 text-sm text-stone-600">
          Live counts from submitted ballots only (drafts are not counted).
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
              Positions
            </h3>
            <div className="mt-3 space-y-4">
              {positions.map((position) => {
                const tallies = tallyFor(position.id, "position");
                return (
                  <div
                    key={position.id}
                    className="rounded-xl border border-stone-100 p-4"
                  >
                    <p className="font-medium text-stone-900">{position.title}</p>
                    {tallies.length === 0 ? (
                      <p className="mt-2 text-sm text-stone-500">No votes yet</p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {tallies.map(({ nominee, count }) => (
                          <li
                            key={nominee.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-stone-700">
                              {nominee.full_name}
                              <span className="text-stone-400">
                                {" "}
                                · {nominee.house}
                              </span>
                            </span>
                            <span className="font-semibold text-emerald-800">
                              {count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
              {positions.length === 0 && (
                <p className="text-sm text-stone-500">No positions yet.</p>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
              Awards
            </h3>
            <div className="mt-3 space-y-4">
              {awards.map((award) => {
                const tallies = tallyFor(award.id, "award");
                return (
                  <div
                    key={award.id}
                    className="rounded-xl border border-stone-100 p-4"
                  >
                    <p className="font-medium text-stone-900">{award.title}</p>
                    {tallies.length === 0 ? (
                      <p className="mt-2 text-sm text-stone-500">No votes yet</p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {tallies.map(({ nominee, count }) => (
                          <li
                            key={nominee.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-stone-700">
                              {nominee.full_name}
                              <span className="text-stone-400">
                                {" "}
                                · {nominee.house}
                              </span>
                            </span>
                            <span className="font-semibold text-emerald-800">
                              {count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
              {awards.length === 0 && (
                <p className="text-sm text-stone-500">No awards yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              Submitted ballots
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Clear one person&apos;s ballot, or reset every submitted ballot.
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            loading={clearingAll}
            disabled={submittedVoters.length === 0}
            onClick={clearAllBallots}
          >
            Reset all ballots
          </Button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 space-y-3">
          {submittedVoters.length === 0 && (
            <p className="text-sm text-stone-500">No ballots submitted yet.</p>
          )}

          {submittedVoters.map((voter) => {
            const votes = votesForUser(voter.id);
            const label = `${voter.first_name} ${voter.last_name}`;
            return (
              <details
                key={voter.id}
                className="rounded-xl border border-stone-100 open:bg-stone-50"
              >
                <summary className="cursor-pointer list-none px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-3">
                  <div>
                    <p className="font-medium text-stone-900">{label}</p>
                    <p className="text-xs text-stone-500">{voter.email}</p>
                  </div>
                  <p className="mt-1 text-xs text-stone-500 sm:mt-0">
                    Submitted{" "}
                    {voter.votes_submitted_at
                      ? new Date(voter.votes_submitted_at).toLocaleString()
                      : "—"}
                  </p>
                </summary>
                <div className="border-t border-stone-100 px-4 py-3">
                  <ul className="space-y-2 text-sm">
                    {votes.map((vote) => {
                      const nominee = nomineeMap.get(vote.nominee_id);
                      const category =
                        positions.find((p) => p.id === vote.position_id)?.title ||
                        awards.find((a) => a.id === vote.award_id)?.title ||
                        "Category";
                      return (
                        <li
                          key={`${vote.user_id}-${vote.nominee_id}-${vote.position_id}-${vote.award_id}`}
                          className="flex flex-wrap items-baseline justify-between gap-2"
                        >
                          <span className="text-stone-500">{category}</span>
                          <span className="font-medium text-stone-900">
                            {nominee
                              ? `${nominee.full_name} (${nominee.house})`
                              : "Unknown nominee"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="danger"
                      loading={loadingId === voter.id}
                      onClick={() => clearBallot(voter.id, label)}
                    >
                      Clear this ballot
                    </Button>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}

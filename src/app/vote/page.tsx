import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getElectionSettings,
  getProfile,
  requireVerifiedUser,
} from "@/lib/auth";
import { resolveIsAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export default async function VoteHomePage() {
  const user = await requireVerifiedUser();
  const profile = await getProfile(user.id);
  const isAdmin = await resolveIsAdmin(user);
  const settings = await getElectionSettings();
  const supabase = await createClient();

  const [{ data: positions }, { data: awards }, { data: drafts }] =
    await Promise.all([
      supabase.from("positions").select("id").order("sort_order"),
      supabase.from("awards").select("id").order("sort_order"),
      supabase
        .from("draft_votes")
        .select("position_id, award_id")
        .eq("user_id", user.id),
    ]);

  const draftPositionCount = (drafts ?? []).filter((d) => d.position_id).length;
  const draftAwardCount = (drafts ?? []).filter((d) => d.award_id).length;
  const totalPositions = positions?.length ?? 0;
  const totalAwards = awards?.length ?? 0;
  const hasSubmitted = !!profile?.votes_submitted_at;
  const readOnly = hasSubmitted || !settings.is_open;

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader
        userName={profile ? `${profile.first_name} ${profile.last_name}` : undefined}
      />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {!settings.is_open && !hasSubmitted && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            Voting is currently closed.
          </div>
        )}
        {hasSubmitted && (
          <div className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Your votes have been submitted. Thank you for voting!
          </div>
        )}

        <h1 className="text-2xl font-bold text-stone-900">Choose a section</h1>
        <p className="mt-2 text-stone-600">
          Select nominees for each position and award. Your picks save automatically.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/vote/positions"
            className="group rounded-2xl border border-stone-200 bg-white p-8 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
              Section 1
            </p>
            <h2 className="mt-2 text-2xl font-bold text-stone-900">POSITIONS</h2>
            <p className="mt-2 text-sm text-stone-600">
              Vote for one nominee per position
            </p>
            <p className="mt-4 text-sm font-medium text-emerald-700">
              {draftPositionCount}/{totalPositions} selected
            </p>
          </Link>

          <Link
            href="/vote/awards"
            className="group rounded-2xl border border-stone-200 bg-white p-8 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
              Section 2
            </p>
            <h2 className="mt-2 text-2xl font-bold text-stone-900">AWARDS</h2>
            <p className="mt-2 text-sm text-stone-600">
              Vote for one nominee per award
            </p>
            <p className="mt-4 text-sm font-medium text-emerald-700">
              {draftAwardCount}/{totalAwards} selected
            </p>
          </Link>
        </div>

        {!readOnly && (
          <div className="mt-8">
            <Link
              href="/vote/review"
              className="inline-flex rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
            >
              Review &amp; submit votes
            </Link>
          </div>
        )}

        {isAdmin && (
          <div className="mt-8">
            <Link href="/admin" className="text-sm font-medium text-emerald-800 hover:underline">
              Admin panel →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

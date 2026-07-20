import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SubmitVotesButton } from "@/components/SubmitVotesButton";
import {
  getElectionSettings,
  getProfile,
  requireVerifiedUser,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ReviewPage() {
  const user = await requireVerifiedUser();
  const profile = await getProfile(user.id);
  const settings = await getElectionSettings();
  const supabase = await createClient();

  if (profile?.votes_submitted_at) {
    return (
      <div className="min-h-screen bg-stone-50">
        <SiteHeader
          userName={`${profile.first_name} ${profile.last_name}`}
        />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-emerald-800">Your votes are already submitted.</p>
          <Link href="/vote" className="mt-4 inline-block text-sm text-emerald-800 hover:underline">
            Back to home
          </Link>
        </main>
      </div>
    );
  }

  const [
    { data: positions },
    { data: awards },
    { data: drafts },
    { data: nominees },
  ] = await Promise.all([
    supabase.from("positions").select("*").order("sort_order"),
    supabase.from("awards").select("*").order("sort_order"),
    supabase.from("draft_votes").select("*").eq("user_id", user.id),
    supabase.from("nominees").select("id, full_name, house"),
  ]);

  const nomineeMap = new Map((nominees ?? []).map((n) => [n.id, n]));
  const draftByPosition = new Map(
    (drafts ?? [])
      .filter((d) => d.position_id)
      .map((d) => [d.position_id, d.nominee_id])
  );
  const draftByAward = new Map(
    (drafts ?? [])
      .filter((d) => d.award_id)
      .map((d) => [d.award_id, d.nominee_id])
  );

  const allComplete =
    (positions ?? []).every((p) => draftByPosition.has(p.id)) &&
    (awards ?? []).every((a) => draftByAward.has(a.id));

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader
        userName={profile ? `${profile.first_name} ${profile.last_name}` : undefined}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/vote" className="text-sm text-emerald-800 hover:underline">
          ← Back to sections
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">Review your votes</h1>
        <p className="mt-2 text-stone-600">
          Check your selections below. You can still change picks before submitting.
        </p>

        {!settings.is_open && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            Voting is closed — you can no longer submit.
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900">Positions</h2>
          <div className="mt-3 space-y-2">
            {(positions ?? []).map((position) => {
              const nomineeId = draftByPosition.get(position.id);
              const nominee = nomineeId ? nomineeMap.get(nomineeId) : null;
              return (
                <div
                  key={position.id}
                  className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4"
                >
                  <div>
                    <p className="font-medium text-stone-900">{position.title}</p>
                    <p className="text-sm text-stone-600">
                      {nominee
                        ? `${nominee.full_name} (${nominee.house})`
                        : "Not selected"}
                    </p>
                  </div>
                  {settings.is_open && (
                    <Link
                      href={`/vote/positions/${position.id}`}
                      className="text-sm font-medium text-emerald-800 hover:underline"
                    >
                      Change
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900">Awards</h2>
          <div className="mt-3 space-y-2">
            {(awards ?? []).map((award) => {
              const nomineeId = draftByAward.get(award.id);
              const nominee = nomineeId ? nomineeMap.get(nomineeId) : null;
              return (
                <div
                  key={award.id}
                  className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4"
                >
                  <div>
                    <p className="font-medium text-stone-900">{award.title}</p>
                    <p className="text-sm text-stone-600">
                      {nominee
                        ? `${nominee.full_name} (${nominee.house})`
                        : "Not selected"}
                    </p>
                  </div>
                  {settings.is_open && (
                    <Link
                      href={`/vote/awards/${award.id}`}
                      className="text-sm font-medium text-emerald-800 hover:underline"
                    >
                      Change
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {settings.is_open && (
          <div className="mt-10">
            {!allComplete && (
              <p className="mb-3 text-sm text-amber-800">
                Complete all positions and awards before submitting.
              </p>
            )}
            <SubmitVotesButton disabled={!allComplete} />
          </div>
        )}
      </main>
    </div>
  );
}

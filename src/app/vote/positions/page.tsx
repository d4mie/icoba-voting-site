import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getElectionSettings,
  getProfile,
  requireVerifiedUser,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PositionsPage() {
  const user = await requireVerifiedUser();
  const profile = await getProfile(user.id);
  const settings = await getElectionSettings();
  const supabase = await createClient();

  const [{ data: positions }, { data: drafts }] = await Promise.all([
    supabase.from("positions").select("*").order("sort_order"),
    supabase
      .from("draft_votes")
      .select("position_id, nominee_id")
      .eq("user_id", user.id)
      .not("position_id", "is", null),
  ]);

  const draftByPosition = new Map(
    (drafts ?? []).map((d) => [d.position_id, d.nominee_id])
  );
  const readOnly = !!profile?.votes_submitted_at || !settings.is_open;

  return (
    <div className="min-h-screen">
      <SiteHeader
        userName={profile ? `${profile.first_name} ${profile.last_name}` : undefined}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/vote" className="text-sm text-amber-300 hover:underline">
          ← Back to sections
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">POSITIONS</h1>
        <p className="mt-2 text-emerald-100">
          Tap a position to see nominees and pick one.
        </p>

        <div className="mt-6 space-y-3">
          {(positions ?? []).map((position) => {
            const hasPick = draftByPosition.has(position.id);
            return (
              <Link
                key={position.id}
                href={`/vote/positions/${position.id}`}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-5 hover:border-emerald-300"
              >
                <div>
                  <h2 className="font-semibold text-stone-900">{position.title}</h2>
                  {position.description && (
                    <p className="mt-1 text-sm text-stone-600">{position.description}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    hasPick
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {readOnly && hasPick
                    ? "Voted"
                    : hasPick
                      ? "Selected"
                      : "Not selected"}
                </span>
              </Link>
            );
          })}
          {(positions ?? []).length === 0 && (
            <p className="text-sm text-stone-500">No positions added yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}

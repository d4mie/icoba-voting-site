import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { ElectionToggle } from "@/components/ElectionToggle";
import { AdminWorkspace } from "@/components/AdminWorkspace";
import { AdminBallots } from "@/components/AdminBallots";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const { profile } = await requireAdmin();
  const supabase = await createClient();

  const [
    { data: settings },
    { data: positions },
    { data: awards },
    { data: nominees },
    { data: allProfiles },
    { data: finalVotes },
    { count: voterCount },
    { count: submittedCount },
  ] = await Promise.all([
    supabase.from("election_settings").select("is_open").eq("id", 1).single(),
    supabase.from("positions").select("id, title, description").order("sort_order"),
    supabase.from("awards").select("id, title, description").order("sort_order"),
    supabase.from("nominees").select("*").order("full_name"),
    supabase
      .from("profiles")
      .select("id, first_name, last_name, email, votes_submitted_at")
      .order("votes_submitted_at", { ascending: false }),
    supabase
      .from("final_votes")
      .select("user_id, nominee_id, position_id, award_id, submitted_at"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("votes_submitted_at", "is", null),
  ]);

  return (
    <div className="min-h-screen">
      <SiteHeader userName={`${profile.first_name} ${profile.last_name}`} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin panel</h1>
            <p className="mt-1 text-sm text-emerald-100">
              Manage categories, nominees, voting status, and submitted ballots.
            </p>
          </div>
          <Link href="/vote" className="text-sm text-amber-300 hover:underline">
            ← Back to voting
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/20 bg-white p-4">
            <p className="text-sm text-stone-500">Registered voters</p>
            <p className="text-2xl font-bold text-stone-900">{voterCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white p-4">
            <p className="text-sm text-stone-500">Submitted ballots</p>
            <p className="text-2xl font-bold text-stone-900">{submittedCount ?? 0}</p>
          </div>
        </div>

        <div className="mt-6">
          <ElectionToggle initialIsOpen={settings?.is_open ?? false} />
        </div>

        <AdminBallots
          positions={(positions ?? []).map((p) => ({ id: p.id, title: p.title }))}
          awards={(awards ?? []).map((a) => ({ id: a.id, title: a.title }))}
          nominees={(nominees ?? []).map((n) => ({
            id: n.id,
            full_name: n.full_name,
            house: n.house,
          }))}
          finalVotes={finalVotes ?? []}
          voters={allProfiles ?? []}
        />

        <AdminWorkspace
          initialPositions={positions ?? []}
          initialAwards={awards ?? []}
          initialNominees={nominees ?? []}
        />
      </main>
    </div>
  );
}

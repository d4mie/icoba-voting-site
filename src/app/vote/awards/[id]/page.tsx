import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { NomineePicker } from "@/components/VoteUI";
import {
  getElectionSettings,
  getProfile,
  requireVerifiedUser,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AwardVotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireVerifiedUser();
  const profile = await getProfile(user.id);
  const settings = await getElectionSettings();
  const supabase = await createClient();

  const [{ data: award }, { data: nominees }, { data: draft }] =
    await Promise.all([
      supabase.from("awards").select("*").eq("id", id).single(),
      supabase
        .from("nominees")
        .select("*")
        .eq("award_id", id)
        .order("sort_order"),
      supabase
        .from("draft_votes")
        .select("nominee_id")
        .eq("user_id", user.id)
        .eq("award_id", id)
        .maybeSingle(),
    ]);

  if (!award) notFound();

  const readOnly = !!profile?.votes_submitted_at || !settings.is_open;

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader
        userName={profile ? `${profile.first_name} ${profile.last_name}` : undefined}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/vote/awards" className="text-sm text-emerald-800 hover:underline">
          ← Back to awards
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">{award.title}</h1>
        {award.description && (
          <p className="mt-2 text-stone-600">{award.description}</p>
        )}
        <p className="mt-2 text-sm text-stone-500">
          Select only one nominee. Your choice saves automatically.
        </p>

        <div className="mt-6">
          <NomineePicker
            categoryType="award"
            categoryId={award.id}
            categoryTitle={award.title}
            nominees={nominees ?? []}
            initialSelectedId={draft?.nominee_id ?? null}
            readOnly={readOnly}
          />
        </div>
      </main>
    </div>
  );
}

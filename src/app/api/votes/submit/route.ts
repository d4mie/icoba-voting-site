import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email_confirmed_at) {
    return NextResponse.json({ error: "Email not verified" }, { status: 403 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("votes_submitted_at")
    .eq("id", user.id)
    .single();

  if (profile?.votes_submitted_at) {
    return NextResponse.json({ error: "Votes already submitted" }, { status: 403 });
  }

  const { data: settings } = await supabase
    .from("election_settings")
    .select("is_open")
    .eq("id", 1)
    .single();

  if (!settings?.is_open) {
    return NextResponse.json({ error: "Voting is closed" }, { status: 403 });
  }

  const [{ data: positions }, { data: awards }, { data: drafts }] =
    await Promise.all([
      supabase.from("positions").select("id"),
      supabase.from("awards").select("id"),
      supabase
        .from("draft_votes")
        .select("id, position_id, award_id, nominee_id")
        .eq("user_id", user.id),
    ]);

  const positionIds = new Set((positions ?? []).map((p) => p.id));
  const awardIds = new Set((awards ?? []).map((a) => a.id));
  const draftPositionIds = new Set(
    (drafts ?? []).filter((d) => d.position_id).map((d) => d.position_id)
  );
  const draftAwardIds = new Set(
    (drafts ?? []).filter((d) => d.award_id).map((d) => d.award_id)
  );

  const missingPositions = [...positionIds].filter((id) => !draftPositionIds.has(id));
  const missingAwards = [...awardIds].filter((id) => !draftAwardIds.has(id));

  if (missingPositions.length > 0 || missingAwards.length > 0) {
    return NextResponse.json(
      {
        error: "Please complete all positions and awards before submitting",
        missingPositions,
        missingAwards,
      },
      { status: 400 }
    );
  }

  const finalRows = (drafts ?? []).map((d) => ({
    user_id: user.id,
    nominee_id: d.nominee_id,
    position_id: d.position_id,
    award_id: d.award_id,
  }));

  const { error: insertError } = await supabase
    .from("final_votes")
    .insert(finalRows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ votes_submitted_at: new Date().toISOString() })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  await supabase.from("draft_votes").delete().eq("user_id", user.id);

  return NextResponse.json({ success: true });
}

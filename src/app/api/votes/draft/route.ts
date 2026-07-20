import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email_confirmed_at) {
    return NextResponse.json({ error: "Email not verified" }, { status: 403 });
  }

  const { nomineeId, positionId, awardId } = await request.json();

  if (!nomineeId || (!positionId && !awardId) || (positionId && awardId)) {
    return NextResponse.json({ error: "Invalid vote data" }, { status: 400 });
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

  const { data: nominee } = await supabase
    .from("nominees")
    .select("id, position_id, award_id")
    .eq("id", nomineeId)
    .single();

  if (!nominee) {
    return NextResponse.json({ error: "Nominee not found" }, { status: 404 });
  }

  if (positionId && nominee.position_id !== positionId) {
    return NextResponse.json({ error: "Nominee mismatch" }, { status: 400 });
  }

  if (awardId && nominee.award_id !== awardId) {
    return NextResponse.json({ error: "Nominee mismatch" }, { status: 400 });
  }

  const voteRow = {
    user_id: user.id,
    nominee_id: nomineeId,
    position_id: positionId ?? null,
    award_id: awardId ?? null,
    updated_at: new Date().toISOString(),
  };

  const conflictColumn = positionId ? "position_id" : "award_id";
  const conflictValue = positionId ?? awardId;

  const { data: existing } = await supabase
    .from("draft_votes")
    .select("id")
    .eq("user_id", user.id)
    .eq(conflictColumn, conflictValue)
    .maybeSingle();

  let result;
  if (existing) {
    result = await supabase
      .from("draft_votes")
      .update(voteRow)
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabase.from("draft_votes").insert(voteRow).select().single();
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ vote: result.data });
}

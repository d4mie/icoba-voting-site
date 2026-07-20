import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("nominees")
    .select("*")
    .order("full_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ nominees: data });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const { fullName, house, photoUrl, positionId, awardId } = await request.json();

  const { data, error } = await supabase
    .from("nominees")
    .insert({
      full_name: fullName,
      house,
      photo_url: photoUrl,
      position_id: positionId,
      award_id: awardId,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ nominee: data });
}

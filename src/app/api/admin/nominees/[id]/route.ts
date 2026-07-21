import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const { fullName, house, photoUrl, positionId, awardId } = await request.json();

  if (!fullName || !house) {
    return NextResponse.json(
      { error: "Full name and house are required" },
      { status: 400 }
    );
  }

  if ((!positionId && !awardId) || (positionId && awardId)) {
    return NextResponse.json(
      { error: "Assign exactly one position or award" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("nominees")
    .update({
      full_name: fullName.trim(),
      house: house.trim(),
      photo_url: photoUrl || null,
      position_id: positionId ?? null,
      award_id: awardId ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ nominee: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const { error } = await supabase.from("nominees").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

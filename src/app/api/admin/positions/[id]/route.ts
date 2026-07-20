import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const { error } = await supabase.from("positions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

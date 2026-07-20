import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const { isOpen } = await request.json();

  const { error } = await supabase
    .from("election_settings")
    .update({ is_open: isOpen, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, isOpen });
}

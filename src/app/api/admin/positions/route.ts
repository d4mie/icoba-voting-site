import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("positions")
    .select("id, title, description")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const { title, description } = await request.json();
  const { data, error } = await supabase
    .from("positions")
    .insert({ title, description: description || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

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

  const { title, description } = await request.json();
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("awards")
    .update({
      title: title.trim(),
      description: description?.trim() || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const { error } = await supabase.from("awards").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

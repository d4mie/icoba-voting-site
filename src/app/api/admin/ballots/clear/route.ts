import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const body = await request.json().catch(() => ({}));
  const clearAll = Boolean(body.all);
  const userId = typeof body.userId === "string" ? body.userId : null;

  if (!clearAll && !userId) {
    return NextResponse.json(
      { error: "Provide userId or set all: true" },
      { status: 400 }
    );
  }

  if (clearAll) {
    const { error } = await supabase.rpc("admin_clear_all_ballots");
    if (error) {
      return NextResponse.json(
        {
          error:
            error.message.includes("Could not find the function") ||
            error.message.includes("schema cache")
              ? "Ballot reset is not set up yet. Run supabase/admin-clear-ballots.sql in the Supabase SQL Editor."
              : error.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, cleared: "all" });
  }

  const { error } = await supabase.rpc("admin_clear_ballot", {
    target_user_id: userId,
  });

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message.includes("Could not find the function") ||
          error.message.includes("schema cache")
            ? "Ballot reset is not set up yet. Run supabase/admin-clear-ballots.sql in the Supabase SQL Editor."
            : error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, cleared: userId });
}

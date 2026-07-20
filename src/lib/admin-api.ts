import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { resolveIsAdmin } from "@/lib/admin";

export async function requireAdminApi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const admin = await resolveIsAdmin(user);
  if (!admin) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { supabase, user };
}

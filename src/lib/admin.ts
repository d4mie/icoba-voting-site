import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/** Comma-separated admin emails in ADMIN_EMAILS env (case-insensitive). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** True if profile.is_admin OR email is in ADMIN_EMAILS. */
export async function resolveIsAdmin(user: User): Promise<boolean> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_admin) return true;
  if (!isAdminEmail(user.email)) return false;

  // Keep DB in sync so RLS admin policies work for writes
  const service = createServiceClient();
  if (service) {
    await service
      .from("profiles")
      .update({ is_admin: true })
      .eq("id", user.id);
  }

  return true;
}

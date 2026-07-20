import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";
import { resolveIsAdmin } from "@/lib/admin";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireVerifiedUser() {
  const user = await requireUser();
  if (!user.email_confirmed_at) redirect("/login?message=verify-email");
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export async function requireAdmin() {
  const user = await requireVerifiedUser();
  const admin = await resolveIsAdmin(user);
  if (!admin) redirect("/vote");

  let profile = await getProfile(user.id);
  if (!profile) {
    profile = {
      id: user.id,
      first_name: (user.user_metadata?.first_name as string) || "Admin",
      last_name: (user.user_metadata?.last_name as string) || "",
      email: user.email ?? "",
      is_admin: true,
      votes_submitted_at: null,
    };
  }

  return { user, profile };
}

export async function getElectionSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("election_settings")
    .select("is_open")
    .eq("id", 1)
    .maybeSingle();
  return data ?? { is_open: false };
}

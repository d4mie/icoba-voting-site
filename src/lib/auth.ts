import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";

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
    .single();
  return data;
}

export async function requireAdmin() {
  const user = await requireVerifiedUser();
  const profile = await getProfile(user.id);
  if (!profile?.is_admin) redirect("/vote");
  return { user, profile };
}

export async function getElectionSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("election_settings")
    .select("is_open")
    .eq("id", 1)
    .single();
  return data ?? { is_open: false };
}

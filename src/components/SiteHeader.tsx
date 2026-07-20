"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { createClient } from "@/lib/supabase/client";

export function SiteHeader({
  userName,
  showLogout = true,
}: {
  userName?: string;
  showLogout?: boolean;
}) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" });
    // Hard navigate so cached session/pages are dropped
    window.location.assign("/login");
  }

  return (
    <header className="border-b border-emerald-900/10 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/vote" className="flex items-center gap-3">
          <BrandLogo size={44} className="h-11 w-11" />
          <div>
            <p className="text-sm font-semibold text-emerald-950">ICOBA Voting</p>
            {userName && (
              <p className="text-xs text-stone-500">Welcome, {userName}</p>
            )}
          </div>
        </Link>
        {showLogout && (
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-medium text-stone-600 hover:text-emerald-900"
          >
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}

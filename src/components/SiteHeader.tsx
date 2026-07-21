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
    window.location.assign("/login");
  }

  return (
    <header className="border-b border-white/15 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/vote" className="flex items-center gap-3">
          <BrandLogo size={44} className="h-11 w-11" />
          <div>
            <p className="text-sm font-semibold text-emerald-950">ICOBA Voting</p>
            {userName && (
              <p className="text-xs text-stone-600">Welcome, {userName}</p>
            )}
          </div>
        </Link>
        {showLogout && (
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-medium text-stone-700 hover:text-emerald-900"
          >
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}

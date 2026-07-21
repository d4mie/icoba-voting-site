import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getProfile, requireVerifiedUser } from "@/lib/auth";

export default async function SubmittedPage() {
  const user = await requireVerifiedUser();
  const profile = await getProfile(user.id);

  return (
    <div className="min-h-screen">
      <SiteHeader
        userName={profile ? `${profile.first_name} ${profile.last_name}` : undefined}
      />
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl border border-white/20 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-800">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Votes submitted</h1>
          <p className="mt-3 text-stone-600">
            Thank you, {profile?.first_name}. Your votes have been recorded and
            cannot be changed.
          </p>
          <Link
            href="/vote"
            className="mt-8 inline-flex rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-amber-300"
          >
            Back to voting home
          </Link>
        </div>
      </main>
    </div>
  );
}

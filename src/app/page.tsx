import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 to-emerald-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <BrandLogo size={112} priority className="mb-6 h-28 w-28 drop-shadow-lg" />
        <h1 className="text-4xl font-bold tracking-tight">ICOBA Voting</h1>
        <p className="mt-4 max-w-lg text-lg text-emerald-100">
          Cast your vote for Positions and Awards. Sign up with your email,
          verify your address, then pick one nominee per category.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {user ? (
            <Link
              href="/vote"
              className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-emerald-950 hover:bg-amber-300"
            >
              Go to voting
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-emerald-950 hover:bg-amber-300"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-white/30 px-6 py-3 font-semibold hover:bg-white/10"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

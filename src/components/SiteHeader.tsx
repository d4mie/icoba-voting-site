import Link from "next/link";

export function SiteHeader({
  userName,
  showLogout = true,
}: {
  userName?: string;
  showLogout?: boolean;
}) {
  return (
    <header className="border-b border-emerald-900/10 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/vote" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-amber-300">
            IC
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-950">ICOBA Voting</p>
            {userName && (
              <p className="text-xs text-stone-500">Welcome, {userName}</p>
            )}
          </div>
        </Link>
        {showLogout && (
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm font-medium text-stone-600 hover:text-emerald-900"
            >
              Sign out
            </button>
          </form>
        )}
      </div>
    </header>
  );
}

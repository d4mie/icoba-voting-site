import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <BrandLogo size={72} priority className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-emerald-950">Sign in to vote</h1>
          <p className="mt-2 text-sm text-stone-600">
            ICOBA Positions &amp; Awards voting
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <LoginForm message={message} />
        </div>
        <p className="mt-6 text-center text-xs text-stone-500">
          <Link href="/" className="hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

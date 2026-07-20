import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <BrandLogo size={72} priority className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-emerald-950">Create your account</h1>
          <p className="mt-2 text-sm text-stone-600">
            Open signup — verify your email before voting
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <SignupForm />
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

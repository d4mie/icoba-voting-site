import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center text-white">
        <BrandLogo size={72} priority className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-emerald-100">
          Open signup — verify your email before voting
        </p>
      </div>
      <div className="rounded-2xl border border-white/20 bg-white p-6 shadow-sm">
        <SignupForm />
      </div>
      <p className="mt-6 text-center text-xs text-emerald-100">
        <Link href="/" className="hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}

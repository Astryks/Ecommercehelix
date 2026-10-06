import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn, authProviders } from "@/auth";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignIn({ searchParams }: PageProps<"/signin">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/dashboard";

  async function dev(form: FormData) {
    "use server";
    await signIn("dev", { name: form.get("name"), redirectTo: next });
  }
  async function google() {
    "use server";
    await signIn("google", { redirectTo: next });
  }
  async function email(form: FormData) {
    "use server";
    await signIn("resend", { email: form.get("email"), redirectTo: next });
  }
  if (!authProviders.dev && !authProviders.google && !authProviders.email) redirect("/");

  return (
    <main className="helix-glow flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <Link href="/"><Logo /></Link>
        <h1 className="mt-8 text-2xl font-bold tracking-tight">Sign in to Helix</h1>
        <p className="mt-1 text-sm text-slate-600">Grow your e-commerce business a little every day.</p>
        <div className="mt-6 space-y-4">
          {authProviders.google && (
            <form action={google}><button className="btn-ghost w-full">Continue with Google</button></form>
          )}
          {authProviders.email && (
            <form action={email} className="space-y-2">
              <label className="text-sm font-medium" htmlFor="m-email">Email me a magic link</label>
              <input id="m-email" name="email" type="email" required className="input" placeholder="you@store.com" />
              <button className="btn-dark w-full">Send magic link</button>
            </form>
          )}
          {authProviders.dev && (
            <form action={dev} className="space-y-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Demo account (no sign-in keys configured)</p>
              <p className="text-xs text-amber-900">Creates a new, separate test account every time. It is not linked to any email, so it cannot open anyone else&apos;s account.</p>
              <div>
                <label className="text-sm font-medium" htmlFor="d-name">Name</label>
                <input id="d-name" name="name" className="input mt-1" placeholder="Your name" maxLength={60} />
              </div>
              <button className="btn-primary w-full">Try a demo account</button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

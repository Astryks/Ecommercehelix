import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { hasDb, prisma } from "@/lib/db";

import { authProviderFlags, createDemoIdentity, isDemoUserId } from "@/lib/demo-auth";

/**
 * Demo login is on only while no real provider (Google or Resend magic links) is configured.
 * Each demo sign-in creates a new isolated test user; see src/lib/demo-auth.ts.
 */
export const authProviders = authProviderFlags(process.env);
const { google: hasGoogle, email: hasEmail } = authProviders;
export const devLoginEnabled = authProviders.dev;

const providers: NextAuthConfig["providers"] = [];
if (hasGoogle) providers.push(Google);
/** Sender shows the brand name; only the address comes from EMAIL_FROM. */
const BRAND = "E-commerce Helix";
const fromAddress = (process.env.EMAIL_FROM ?? "hello@example.com").match(/<([^>]+)>/)?.[1] ?? (process.env.EMAIL_FROM ?? "hello@example.com").trim();
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
if (hasEmail)
  providers.push(
    Resend({
      from: `${BRAND} <${fromAddress}>`,
      async sendVerificationRequest({ identifier, url, provider }) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject: `Sign in to ${BRAND}`,
            text: `Sign in to ${BRAND}\n\n${url}\n\nIf you did not ask for this email, you can ignore it.`,
            html: `<div style="font-family:Nunito,system-ui,sans-serif;max-width:480px;margin:auto;padding:24px;background:#F2F1EC;color:#1A1718"><h1 style="font-size:24px;color:#6258DF;font-family:'Caveat Brush','Comic Sans MS',cursive;font-weight:400">Sign in to ${BRAND}</h1><p><a href="${esc(url)}" style="display:inline-block;background:#6258DF;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none">Sign in</a></p><p style="color:#55514C;font-size:13px">If you did not ask for this email, you can ignore it.</p></div>`,
          }),
        });
        if (!res.ok) throw new Error(`Resend error ${res.status}`);
      },
    }),
  );
if (devLoginEnabled)
  providers.push(
    Credentials({
      id: "dev",
      name: "Demo account",
      credentials: { name: { label: "Name" } },
      // Ignores any email sent with the form: a demo login always gets a brand new test user.
      authorize: async (c) => {
        const { id, email, name } = createDemoIdentity(c?.name);
        return { id, email, name };
      },
    }),
  );

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: hasDb ? PrismaAdapter(prisma) : undefined,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET ?? (devLoginEnabled ? "helix-dev-only-secret-change-me" : undefined),
  trustHost: true,
  providers,
  pages: { signIn: "/signin" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? token.sub ?? "";
        session.user.isDemo = isDemoUserId(session.user.id);
      }
      return session;
    },
  },
});

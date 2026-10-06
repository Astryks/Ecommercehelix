import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { hasDb, prisma } from "@/lib/db";

const hasGoogle = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const hasEmail = Boolean(hasDb && process.env.AUTH_RESEND_KEY);

/** Dev login is on when no real provider is configured, or explicitly enabled. Never use in production with real users. */
export const devLoginEnabled = process.env.ALLOW_DEV_LOGIN === "true" || (!hasGoogle && !hasEmail);
export const authProviders = { google: hasGoogle, email: hasEmail, dev: devLoginEnabled };

const providers: NextAuthConfig["providers"] = [];
if (hasGoogle) providers.push(Google);
if (hasEmail) providers.push(Resend({ from: process.env.EMAIL_FROM ?? "Helix <hello@example.com>" }));
if (devLoginEnabled)
  providers.push(
    Credentials({
      id: "dev",
      name: "Demo login",
      credentials: { email: { label: "Email" }, name: { label: "Name" } },
      authorize: async (c) => {
        const email = String(c?.email ?? "").trim().toLowerCase() || "demo@helix.local";
        const name = String(c?.name ?? "").trim() || email.split("@")[0];
        return { id: "dev-" + email.replace(/[^a-z0-9]/g, "-"), email, name };
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
      if (session.user) session.user.id = (token.uid as string) ?? token.sub ?? "";
      return session;
    },
  },
});

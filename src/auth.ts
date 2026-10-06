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
if (hasEmail) providers.push(Resend({ from: process.env.EMAIL_FROM ?? "Helix <hello@example.com>" }));
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

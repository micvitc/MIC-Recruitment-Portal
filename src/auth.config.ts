import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_DOMAIN = "vitstudent.ac.in";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    /**
     * Block sign-in for any email not from @vitstudent.ac.in
     * This fires before the user is created in the database.
     */
    async signIn({ user }) {
      const email = user.email ?? "";
      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        // Returning false cancels sign-in and shows NextAuth's default error
        return false;
      }
      return true;
    },

    /**
     * Populate the JWT token with the user's id and role when signing in.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "student";
      }
      return token;
    },

    /**
     * Attach the user's id and role from the JWT token to the session so
     * client components and API routes can read them.
     */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "student";
      }
      return session;
    },
  },
  // Use only AUTH_SECRET — do NOT add a fallback here. Having two possible
  // secret sources is a footgun; if one leaks the other silently takes over.
  // Generate with: openssl rand -base64 32
  secret: process.env.AUTH_SECRET,
  pages: {
    error: "/auth/error", // Custom error page for blocked sign-ins
  },
} satisfies NextAuthConfig;

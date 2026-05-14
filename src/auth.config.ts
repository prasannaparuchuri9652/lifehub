import type { NextAuthConfig } from "next-auth";

// Lightweight config — no DB imports, safe for Edge Runtime (middleware).
// The full config with DrizzleAdapter lives in src/auth.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isAuthPage = pathname === "/login" || pathname === "/register";
      const isApiAuth = pathname.startsWith("/api/auth");

      if (isApiAuth) return true;

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;

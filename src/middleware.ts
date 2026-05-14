import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Uses the lightweight config — no pg/DB imports, runs fine in Edge Runtime.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

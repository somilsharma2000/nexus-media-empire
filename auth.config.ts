import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isAdminRoute = pathname === "/admin" || (pathname.startsWith("/admin/") && pathname !== "/admin/login");

      if (isAdminRoute) {
        if (isLoggedIn) return true;
        return false; // NextAuth automatically redirects to pages.signIn
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

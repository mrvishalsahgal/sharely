import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith("/login") || 
                         nextUrl.pathname.startsWith("/signup") ||
                         nextUrl.pathname.startsWith("/forgot-password")
      
      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl))
        return true
      }

      if (!isLoggedIn) {
        return false // Redirect to login
      }

      return true
    },
  },
  providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig

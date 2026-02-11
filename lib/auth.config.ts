import type { NextAuthConfig } from "next-auth"

export type UserRole = "ADMIN" | "SELLER" | "CUSTOMER"

/**
 * Lightweight auth config that does NOT import Prisma or bcryptjs.
 * Used by the Edge middleware to keep the bundle under 1 MB.
 * The full auth config (with the Credentials provider) is in auth.ts.
 */
export const authConfig = {
    trustHost: true,
    providers: [],  // Providers are added in the full auth.ts
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isProtected = ["/dashboard", "/manage-products", "/sell", "/profile"].some(
                (path) => nextUrl.pathname.startsWith(path)
            )

            if (isProtected && !isLoggedIn) {
                const loginUrl = new URL("/login", nextUrl.origin)
                loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
                return Response.redirect(loginUrl)
            }

            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as { role: UserRole }).role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as UserRole
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig

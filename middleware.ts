import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const userRole = req.auth?.user?.role

    // If not logged in, redirect to login with callback URL
    if (!isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl.origin)
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Role-based access control for admin routes (dashboard)
    if (nextUrl.pathname.startsWith("/dashboard")) {
        if (userRole !== "ADMIN") {
            // Non-admins trying to access admin pages get redirected
            return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin))
        }
    }

    // Role-based access control for seller routes
    if (nextUrl.pathname.startsWith("/manage-products") || nextUrl.pathname.startsWith("/sell")) {
        if (userRole !== "SELLER" && userRole !== "ADMIN") {
            return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin))
        }
    }

    // All checks passed, continue to the page
    return NextResponse.next()
})

export const config = {
    matcher: [
        // Protected routes - middleware will run on these paths
        "/dashboard/:path*",
        "/manage-products/:path*",
        "/sell/:path*",
        "/profile/:path*",
        "/api/order/:path*",
    ],
}

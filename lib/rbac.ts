import { auth } from "./auth"
import { redirect } from "next/navigation"

export type Role = "ADMIN" | "SELLER" | "CUSTOMER"

// Define permissions for each role
export const rolePermissions: Record<Role, string[]> = {
    ADMIN: [
        "view:dashboard",
        "manage:users",
        "manage:sellers",
        "view:all-products",
        "view:all-orders",
        "delete:products",
        "delete:users",
        "update:user-roles",
    ],
    SELLER: [
        "view:seller-dashboard",
        "create:products",
        "update:own-products",
        "delete:own-products",
        "view:own-products",
        "view:own-orders",
    ],
    CUSTOMER: [
        "view:profile",
        "create:orders",
        "view:own-orders",
        "update:own-profile",
    ],
}

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: string): boolean {
    return rolePermissions[role]?.includes(permission) ?? false
}

// Get the current user's session
export async function getCurrentUser() {
    const session = await auth()
    return session?.user ?? null
}

// Session user type
interface SessionUser {
    id: string
    email: string
    role: Role
}

// Check if user has required role(s)
export async function checkRole(
    allowedRoles: Role[]
): Promise<{ authorized: boolean; user: SessionUser | null }> {
    const session = await auth()

    if (!session?.user) {
        return { authorized: false, user: null }
    }

    const isAuthorized = allowedRoles.includes(session.user.role as Role)
    return { authorized: isAuthorized, user: session.user as SessionUser }
}

// Server-side role guard - use in server components
export async function requireRole(allowedRoles: Role[], redirectTo: string = "/login") {
    const { authorized, user } = await checkRole(allowedRoles)

    if (!authorized) {
        if (!user) {
            redirect(redirectTo)
        }
        // User is logged in but doesn't have the required role
        redirect("/unauthorized")
    }

    return user
}

// Get appropriate dashboard URL based on role
export function getDashboardByRole(role: Role): string {
    switch (role) {
        case "ADMIN":
            return "/dashboard"
        case "SELLER":
            return "/manage-products"
        case "CUSTOMER":
            return "/profile"
        default:
            return "/"
    }
}

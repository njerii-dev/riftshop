import "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email: string
            role: "ADMIN" | "SELLER" | "CUSTOMER"
        }
    }

    interface User {
        id: string
        email: string
        role: "ADMIN" | "SELLER" | "CUSTOMER"
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: "ADMIN" | "SELLER" | "CUSTOMER"
    }
}

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { authConfig } from "./auth.config"

export type { UserRole } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null
                    }

                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email as string },
                    })

                    if (!user) {
                        return null
                    }

                    const passwordMatch = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    )

                    if (!passwordMatch) {
                        return null
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    }
                } catch (error) {
                    console.error("Auth error:", error)
                    return null
                }
            },
        }),
    ],
})

"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

// Admin-only: Update a user's role
export async function updateUserRole(userId: string, newRole: "ADMIN" | "SELLER" | "CUSTOMER") {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Only admins can update roles
    if (session.user.role !== "ADMIN") {
        return { error: "Only admins can update user roles" }
    }

    // Prevent admin from changing their own role
    if (userId === session.user.id) {
        return { error: "You cannot change your own role" }
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
    })

    return { success: true }
}

// Admin-only: Delete a user
export async function deleteUser(userId: string) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Only admins can delete users
    if (session.user.role !== "ADMIN") {
        return { error: "Only admins can delete users" }
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
        return { error: "You cannot delete your own account" }
    }

    // Delete user's products and orders first
    await prisma.order.deleteMany({
        where: { customerId: userId },
    })

    await prisma.product.deleteMany({
        where: { sellerId: userId },
    })

    await prisma.user.delete({
        where: { id: userId },
    })

    return { success: true }
}

// Admin-only: Get all users with stats
export async function getAllUsers() {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return []
    }

    return prisma.user.findMany({
        include: {
            products: true,
            purchases: true,
        },
        orderBy: { id: "desc" },
    })
}

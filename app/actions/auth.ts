"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as any // ADMIN, SELLER, or CUSTOMER

  // 1. Save the user to Neon via Prisma
  await prisma.user.create({
    data: {
      email,
      password, // Note: In a real app, we would hash this!
      role,
    },
  })

  // 2. Send them to the login page once they are registered
  redirect("/login")
}
"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as any

  if (!email || !password) return;

  // Save to Neon
  await prisma.user.create({
    data: {
      email,
      password, // Note: In production, we'd hash this!
      role,
    },
  })

  // After signing up, send them to login
  redirect("/login")
}
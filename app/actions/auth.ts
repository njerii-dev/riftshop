"use server"

import { prisma } from "@/lib/prisma"
import { signIn, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as "ADMIN" | "SELLER" | "CUSTOMER"

  if (!email || !password) {
    throw new Error("Email and password are required")
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters")
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error("Email already registered")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user with validated role (prevent non-admins from creating admins)
  const validRole = role === "SELLER" ? "SELLER" : "CUSTOMER"

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: validRole,
    },
  })

  // After signing up, send them to login
  redirect("/login")
}

export async function loginUser(formData: FormData): Promise<{ error?: string; redirectTo?: string }> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  // First verify the credentials manually
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true, role: true },
  })

  if (!user) {
    return { error: "Invalid email or password" }
  }

  const bcrypt = await import("bcryptjs")
  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return { error: "Invalid email or password" }
  }

  // Now sign in - credentials are verified
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" }
        default:
          return { error: "Something went wrong" }
      }
    }
    // Re-throw non-auth errors (like NEXT_REDIRECT)
    throw error
  }

  // Determine redirect based on role
  switch (user.role) {
    case "ADMIN":
      return { redirectTo: "/dashboard" }
    case "SELLER":
      return { redirectTo: "/manage-products" }
    case "CUSTOMER":
    default:
      return { redirectTo: "/profile" }
  }
}

export async function logoutUser() {
  await signOut({ redirect: false })
  redirect("/")
}

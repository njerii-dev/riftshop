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

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

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
          throw new Error("Invalid email or password")
        default:
          throw new Error("Something went wrong")
      }
    }
    throw error
  }

  // Get the user to determine redirect
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  })

  // Redirect based on role
  switch (user?.role) {
    case "ADMIN":
      redirect("/dashboard")
    case "SELLER":
      redirect("/manage-products")
    case "CUSTOMER":
    default:
      redirect("/profile")
  }
}

export async function logoutUser() {
  await signOut({ redirect: false })
  redirect("/")
}

"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createProduct(formData: FormData) {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    redirect("/unauthorized")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  const imageUrl = formData.get("imageUrl") as string // Added this for your Cloudinary links

  if (!name || !description || isNaN(price)) {
    throw new Error("Valid name, description, and price are required")
  }

  await prisma.product.create({
    data: {
      name,
      description,
      price,
      imageUrl,
      sellerId: session.user.id,
    },
  })

  revalidatePath("/manage-products")
  revalidatePath("/marketplace")
  redirect("/manage-products")
}

export async function deleteProduct(productId: string) {
  const session = await auth()

  if (!session?.user) redirect("/login")

  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) throw new Error("Product not found")

  // Permission check
  if (session.user.role === "SELLER" && product.sellerId !== session.user.id) {
    throw new Error("You can only delete your own products")
  }
  if (session.user.role === "CUSTOMER") {
    throw new Error("Customers cannot delete products")
  }

  await prisma.product.delete({
    where: { id: productId },
  })

  revalidatePath("/manage-products")
  revalidatePath("/marketplace")
  redirect("/manage-products")
}

export async function updateProduct(productId: string, formData: FormData) {
  const session = await auth()

  if (!session?.user) redirect("/login")

  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) throw new Error("Product not found")

  if (session.user.role === "SELLER" && product.sellerId !== session.user.id) {
    throw new Error("You can only update your own products")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  const imageUrl = formData.get("imageUrl") as string

  await prisma.product.update({
    where: { id: productId },
    data: { name, description, price, imageUrl },
  })

  revalidatePath("/manage-products")
  revalidatePath("/marketplace")
  redirect("/manage-products")
}

export async function purchaseProduct(productId: string) {
  const session = await auth()

  if (!session?.user) redirect("/login")

  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) throw new Error("Product not found")

  await prisma.order.create({
    data: {
      productId: product.id,
      customerId: session.user.id,
    },
  })

  revalidatePath("/profile")
  redirect("/profile")
}
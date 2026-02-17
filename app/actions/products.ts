"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// 1. CREATE
export async function createProduct(formData: FormData) {
  const session = await auth()

  if (!session?.user) redirect("/login")

  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    redirect("/unauthorized")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  const imageUrl = formData.get("imageUrl") as string

  if (!name || !description || isNaN(price)) {
    throw new Error("Missing required fields")
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
  redirect("/manage-products")
}

// 2. DELETE
export async function deleteProduct(productId: string) {
  const session = await auth()

  if (!session?.user) redirect("/login")

  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) throw new Error("Product not found")

  // Check if user is allowed to delete
  if (session.user.role === "SELLER" && product.sellerId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  await prisma.product.delete({
    where: { id: productId },
  })

  revalidatePath("/manage-products")
  // We don't use redirect here so the user stays on the manage page
}

// 3. UPDATE
export async function updateProduct(productId: string, formData: FormData) {
  const session = await auth()

  if (!session?.user) redirect("/login")

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  const imageUrl = formData.get("imageUrl") as string

  await prisma.product.update({
    where: { id: productId },
    data: { name, description, price, imageUrl },
  })

  revalidatePath("/manage-products")
  redirect("/manage-products")
}

// 4. PURCHASE
export async function purchaseProduct(productId: string) {
  const session = await auth()

  if (!session?.user) redirect("/login")

  await prisma.order.create({
    data: {
      productId,
      customerId: session.user.id,
    },
  })

  revalidatePath("/profile")
  redirect("/profile")
}
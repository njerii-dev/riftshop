"use server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { requireRole } from "@/lib/rbac"

export async function createProduct(formData: FormData) {
  // 1. Extract the data from your form fields
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const description = formData.get("description") as string;
  const image_url = formData.get("image_url") as string; // <--- Add this

  // 2. Save it to Neon via Prisma
  await prisma.product.create({
    data: {
      name,
      price,
      description,
      image_url, // <--- Add this
      sellerId: "some-user-id", // This usually comes from your auth
    }
  });
}

if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
  redirect("/unauthorized")
}

const name = formData.get("name") as string
const description = formData.get("description") as string
const price = parseFloat(formData.get("price") as string)

if (!name || !description || !price) {
  throw new Error("All fields are required")
}

await prisma.product.create({
  data: {
    name,
    description,
    price,
    sellerId: session.user.id,
  },
})

// Take the seller to manage their products
redirect("/manage-products")
}

export async function deleteProduct(productId: string) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  // Sellers can only delete their own products, admins can delete any
  if (session.user.role === "SELLER" && product.sellerId !== session.user.id) {
    throw new Error("You can only delete your own products")
  }

  if (session.user.role === "CUSTOMER") {
    throw new Error("Customers cannot delete products")
  }

  await prisma.product.delete({
    where: { id: productId },
  })

  redirect("/manage-products")
}

export async function updateProduct(
  productId: string,
  formData: FormData
) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  // Sellers can only update their own products, admins can update any
  if (session.user.role === "SELLER" && product.sellerId !== session.user.id) {
    throw new Error("You can only update your own products")
  }

  if (session.user.role === "CUSTOMER") {
    throw new Error("Customers cannot update products")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)

  await prisma.product.update({
    where: { id: productId },
    data: { name, description, price },
  })

  redirect("/manage-products")
}

// Customer purchases a product
export async function purchaseProduct(productId: string) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  // Create order
  await prisma.order.create({
    data: {
      productId: product.id,
      customerId: session.user.id,
    },
  })

  redirect("/profile")
}
"use server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)

  // We are going to find the first user in your DB to "own" this product
  // Later, we will make this the logged-in user!
  const user = await prisma.user.findFirst();

  if (!user) {
    throw new Error("No user found in database. Please register a user first!");
  }

  await prisma.product.create({
    data: {
      name,
      description,
      price,
      sellerId: user.id,
    },
  })

  // Take the user back to the marketplace to see their new item
  redirect("/")
}
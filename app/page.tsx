import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Marketplace() {
  // 1. Fetch products from Neon
  const products = await prisma.product.findMany({
    include: {
      seller: true, // This gets the seller's email too
    },
    orderBy: {
      id: 'desc' // Newest items first
    }
  });

  return (
  <div className="max-w-7xl mx-auto p-8">
    <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Marketplace</h1>
        <p className="text-lg text-gray-600">Discover unique items from sellers around the world.</p>
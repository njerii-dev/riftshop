import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Starting database seed...")

    // Hash passwords
    const adminPassword = await bcrypt.hash("Admin@123", 12)
    const sellerPassword = await bcrypt.hash("Seller@123", 12)
    const customerPassword = await bcrypt.hash("Customer@123", 12)

    // Create Admin user
    const admin = await prisma.user.upsert({
        where: { email: "admin@riftshop.com" },
        update: {},
        create: {
            email: "admin@riftshop.com",
            password: adminPassword,
            role: "ADMIN",
        },
    })
    console.log("✅ Created Admin:", admin.email)

    // Create Seller user
    const seller = await prisma.user.upsert({
        where: { email: "seller@riftshop.com" },
        update: {},
        create: {
            email: "seller@riftshop.com",
            password: sellerPassword,
            role: "SELLER",
        },
    })
    console.log("✅ Created Seller:", seller.email)

    // Create Customer user
    const customer = await prisma.user.upsert({
        where: { email: "customer@riftshop.com" },
        update: {},
        create: {
            email: "customer@riftshop.com",
            password: customerPassword,
            role: "CUSTOMER",
        },
    })
    console.log("✅ Created Customer:", customer.email)

    // Create some sample products for the seller
    const product1 = await prisma.product.upsert({
        where: { id: "sample-product-1" },
        update: {},
        create: {
            id: "sample-product-1",
            name: "Vintage Camera",
            description: "A beautiful vintage film camera from the 1970s. Perfect for collectors and photography enthusiasts.",
            price: 299.99,
            sellerId: seller.id,
        },
    })

    const product2 = await prisma.product.upsert({
        where: { id: "sample-product-2" },
        update: {},
        create: {
            id: "sample-product-2",
            name: "Handmade Leather Wallet",
            description: "Premium handcrafted leather wallet with multiple card slots and coin pocket.",
            price: 79.99,
            sellerId: seller.id,
        },
    })

    const product3 = await prisma.product.upsert({
        where: { id: "sample-product-3" },
        update: {},
        create: {
            id: "sample-product-3",
            name: "Wireless Bluetooth Headphones",
            description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
            price: 149.99,
            sellerId: seller.id,
        },
    })

    console.log("✅ Created 3 sample products")

    // Create a sample order for the customer
    const order = await prisma.order.upsert({
        where: { id: "sample-order-1" },
        update: {},
        create: {
            id: "sample-order-1",
            productId: product1.id,
            customerId: customer.id,
        },
    })
    console.log("✅ Created sample order")

    console.log("\n🎉 Database seeding completed!")
    console.log("\n📋 Test Credentials:")
    console.log("────────────────────────────────────")
    console.log("ADMIN:    admin@riftshop.com    / Admin@123")
    console.log("SELLER:   seller@riftshop.com   / Seller@123")
    console.log("CUSTOMER: customer@riftshop.com / Customer@123")
    console.log("────────────────────────────────────")
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

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
        update: {
            imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988143/Screenshot_2026-02-13_160332_p80mb1.png",
        },
        create: {
            id: "sample-product-1",
            name: "Iphone 13 pro",
            description: "Blue 6.1 inch iphone 13 with Aluminum edge",
            price: 99.99,
            imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988143/Screenshot_2026-02-13_160332_p80mb1.png",
            sellerId: seller.id,
        },
    })

    const product2 = await prisma.product.upsert({
        where: { id: "sample-product-2" },
        update: {
            imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988154/Screenshot_2026-02-13_160416_bwtlp9.png",
        },
        create: {
            id: "sample-product-2",
            name: "Samsung Tv",
            description: "42 inch Samsung TV",
            price: 149.50,
            imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988154/Screenshot_2026-02-13_160416_bwtlp9.png",
            sellerId: seller.id,
        },
    })

    const product3 = await prisma.product.upsert({
        where: { id: "sample-product-3" },
        update: {
            imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988165/Screenshot_2026-02-13_160531_mifzlg.png",
        },
        create: {
            id: "sample-product-3",
            name: "Think pad lenovo",
            description: "Black think pad with 4gb ram",
            price: 75.00,
            imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988165/Screenshot_2026-02-13_160531_mifzlg.png",
            sellerId: seller.id,
        },
    })

    const product4 = await prisma.product.upsert({
        where: { id: "sample-product-4" },
        update: {
            imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988176/Screenshot_2026-02-13_160618_j4nwey.png",
        },
        create: {
            id: "sample-product-4",
            name: "Vintage Camera",
            description: "A grey vintage camera with 6gb storage",
            price: 200.00,
            imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988176/Screenshot_2026-02-13_160618_j4nwey.png",
            sellerId: seller.id,
        },
    })

    const product5 = await prisma.product.upsert({
        where: { id: "sample-product-5" },
        update: {
            imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988188/Screenshot_2026-02-13_160711_tvgjig.png",
        },
        create: {
            id: "sample-product-5",
            name: "Handmade leather wallet",
            description: "Brown handmade leather wallet with 7 card slots and cash compartment",
            price: 120.00,
            imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988188/Screenshot_2026-02-13_160711_tvgjig.png",
            sellerId: seller.id,
        },
    })

    const product6 = await prisma.product.upsert({
        where: { id: "sample-product-6" },
        update: {
            imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988204/Screenshot_2026-02-13_160751_qrggex.png",
        },
        create: {
            id: "sample-product-6",
            name: "Wireless earpods",
            description: "Black wireless earpods with 24 hour battery life",
            price: 310.00,
            imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988204/Screenshot_2026-02-13_160751_qrggex.png",
            sellerId: seller.id,
        },
    })

    console.log("✅ Created 6 sample products")

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

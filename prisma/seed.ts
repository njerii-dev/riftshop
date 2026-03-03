import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Starting database seed...")

    const password = await bcrypt.hash("Seller@123", 12)

    // Create a universal seller for these products
    const seller = await prisma.user.upsert({
        where: { email: "seller@riftshop.com" },
        update: {},
        create: {
            id: "s1",
            email: "seller@riftshop.com",
            password: password,
            role: "SELLER",
        },
    })

    const products = [
        { id: "p1", name: "Iphone 13 pro", price: 1, description: "Blue 6.1 inch iphone 13 with Aluminum edge", imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988143/Screenshot_2026-02-13_160332_p80mb1.png" },
        { id: "p2", name: "Samsung Tv", price: 1, description: "42 inch Samsung TV", imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988154/Screenshot_2026-02-13_160416_bwtlp9.png" },
        { id: "p3", name: "Think pad lenovo", price: 1, description: "Black think pad with 4gb ram", imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988165/Screenshot_2026-02-13_160531_mifzlg.png" },
        { id: "p4", name: "Vintage Camera", price: 1, description: "A grey vintage camera with 6gb storage", imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988176/Screenshot_2026-02-13_160618_j4nwey.png" },
        { id: "p5", name: "Handmade leather wallet", price: 1, description: "Brown handmade leather wallet", imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988188/Screenshot_2026-02-13_160711_tvgjig.png" },
        { id: "p6", name: "Wireless earpods", price: 1, description: "Black wireless earpods", imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988204/Screenshot_2026-02-13_160751_qrggex.png" }
    ]

    for (const p of products) {
        await prisma.product.upsert({
            where: { id: p.id },
            update: {},
            create: {
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                imageUrl: p.imageUrl,
                sellerId: seller.id,
            },
        })
    }

    console.log("✅ All 6 products seeded successfully!")
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
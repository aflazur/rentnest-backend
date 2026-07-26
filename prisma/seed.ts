import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

async function main() {
    console.log("🌱 Seeding RentNest database...");

    // ---- Admin ----
    const adminEmail = process.env.ADMIN_EMAIL || "admin@rentnest.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedAdminPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            name: process.env.ADMIN_NAME || "RentNest Admin",
            email: adminEmail,
            password: hashedAdminPassword,
            role: "ADMIN",
        },
    });
    console.log(`✅ Admin ready: ${admin.email}`);

    // ---- Categories ----
    const categoriesData = [
        { name: "Apartment", slug: "apartment", description: "Multi-unit residential buildings" },
        { name: "House", slug: "house", description: "Standalone family houses" },
        { name: "Studio", slug: "studio", description: "Compact single-room living spaces" },
        { name: "Condo", slug: "condo", description: "Privately owned units within a larger building" },
        { name: "Room", slug: "room", description: "Single room for rent, shared facilities" },
    ];

    const categories = [];
    for (const c of categoriesData) {
        const category = await prisma.category.upsert({ where: { name: c.name }, update: {}, create: c });
        categories.push(category);
    }
    console.log(`✅ Seeded ${categories.length} categories`);

    // ---- Sample Landlord ----
    const landlordPassword = await bcrypt.hash("landlord123", SALT_ROUNDS);
    const landlord = await prisma.user.upsert({
        where: { email: "landlord@rentnest.com" },
        update: {},
        create: {
            name: "Rafiq Islam",
            email: "landlord@rentnest.com",
            password: landlordPassword,
            phone: "01711111111",
            role: "LANDLORD",
        },
    });
    console.log(`✅ Sample landlord ready: ${landlord.email} / landlord123`);

    // ---- Sample Tenant ----
    const tenantPassword = await bcrypt.hash("tenant123", SALT_ROUNDS);
    const tenant = await prisma.user.upsert({
        where: { email: "tenant@rentnest.com" },
        update: {},
        create: {
            name: "Sadia Rahman",
            email: "tenant@rentnest.com",
            password: tenantPassword,
            phone: "01722222222",
            role: "TENANT",
        },
    });
    console.log(`✅ Sample tenant ready: ${tenant.email} / tenant123`);

    // ---- Sample Properties ----
    const apartmentCategory = categories.find((c) => c.slug === "apartment")!;
    const studioCategory = categories.find((c) => c.slug === "studio")!;

    const existingProperties = await prisma.property.count({ where: { landlordId: landlord.id } });

    if (existingProperties === 0) {
        await prisma.property.createMany({
            data: [
                {
                    title: "Cozy 2-Bed Apartment in Dhanmondi",
                    description:
                        "A well-lit, fully-furnished 2 bedroom apartment near Dhanmondi Lake with 24/7 security and generator backup.",
                    price: 25000,
                    type: "APARTMENT",
                    address: "Road 8, Dhanmondi",
                    city: "Dhaka",
                    area: "Dhanmondi",
                    bedrooms: 2,
                    bathrooms: 2,
                    sizeSqft: 1100,
                    amenities: ["Generator", "Lift", "Security", "Parking"],
                    images: [],
                    categoryId: apartmentCategory.id,
                    landlordId: landlord.id,
                },
                {
                    title: "Modern Studio near Gulshan Circle 2",
                    description: "Compact, modern studio unit ideal for a single professional. Walking distance to Gulshan Circle 2.",
                    price: 18000,
                    type: "STUDIO",
                    address: "Gulshan Avenue",
                    city: "Dhaka",
                    area: "Gulshan",
                    bedrooms: 1,
                    bathrooms: 1,
                    sizeSqft: 550,
                    amenities: ["Wifi", "Security"],
                    images: [],
                    categoryId: studioCategory.id,
                    landlordId: landlord.id,
                },
            ],
        });
        console.log("✅ Seeded 2 sample properties");
    }

    console.log("🎉 Seeding complete!");
    console.log("----------------------------------------");
    console.log(`Admin login    -> ${adminEmail} / ${adminPassword}`);
    console.log(`Landlord login -> landlord@rentnest.com / landlord123`);
    console.log(`Tenant login   -> tenant@rentnest.com / tenant123`);
    console.log("----------------------------------------");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
import "dotenv/config";
import { prisma } from "../src/config/prisma.js";
import { hashPassword } from "../src/lib/password.js";

const seedAdmin = async () => {
    const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@amrohub.com").toLowerCase();
    const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
    const name = process.env.SEED_ADMIN_NAME ?? "Super Admin";
    const phoneNumber = process.env.SEED_ADMIN_PHONE ?? "0599000000";

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
        console.log(`✔ Admin already exists: ${email}`);
        return;
    }

    const admin = await prisma.admin.create({
        data: {
            name,
            email,
            phoneNumber,
            hashedPassword: await hashPassword(password),
            permissions: ["super_admin"],
        },
    });
    console.log("✅ Seeded admin:");
    console.log(`   email:    ${admin.email}`);
    console.log(`   password: ${password}`);
    console.log("   ⚠  Change this password after first login.");
};

const seedSettings = async () => {
    const defaults: Array<[string, string, string]> = [
        ["hourly_rate", "4.00", "Hourly session rate"],
        ["free_hours",  "0",    "Free hours per session"],
    ];
    for (const [key, value, description] of defaults) {
        await prisma.settings.upsert({
            where: { key },
            update: {},
            create: { key, value, description, group: "session" },
        });
    }
    console.log("✅ Seeded settings");
};

const main = async () => {
    await seedAdmin();
    await seedSettings();
};

main()
    .catch((err) => {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
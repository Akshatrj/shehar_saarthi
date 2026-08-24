import { prisma } from "./client";

const DEPARTMENTS = [
  { name: "Roads", slug: "roads" },
  { name: "Sanitation", slug: "sanitation" },
  { name: "Electrical", slug: "electrical" },
  { name: "Water", slug: "water" },
  { name: "Parks", slug: "parks" },
] as const;

async function main() {
  for (const department of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { slug: department.slug },
      update: { name: department.name, isActive: true },
      create: department,
    });
  }

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!superAdminEmail) {
    throw new Error(
      "SUPER_ADMIN_EMAIL is required. Set it in .env.local before running the seed.",
    );
  }

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      role: "SUPER_ADMIN",
      name: "Super Admin",
      isActive: true,
    },
    create: {
      email: superAdminEmail,
      role: "SUPER_ADMIN",
      name: "Super Admin",
      isActive: true,
    },
  });

  console.log(`Seeded ${DEPARTMENTS.length} departments and super admin ${superAdminEmail}.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

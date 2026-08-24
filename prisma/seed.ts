import { prisma } from "./client";

const DEPARTMENTS = [
  { name: "Roads", code: "roads" },
  { name: "Sanitation", code: "sanitation" },
  { name: "Electrical", code: "electrical" },
  { name: "Water", code: "water" },
  { name: "Parks", code: "parks" },
] as const;

async function main() {
  for (const department of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { code: department.code },
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
      departmentId: null,
      isActive: true,
    },
    create: {
      email: superAdminEmail,
      role: "SUPER_ADMIN",
      name: "Super Admin",
      departmentId: null,
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

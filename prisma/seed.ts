import { prisma } from "./client";
import type { ComplaintCategory } from "@prisma/client";

const DEFAULT_DEPARTMENTS = [
  {
    name: "Roads",
    code: "roads",
    description: "Roads, potholes, footpaths, and road obstructions.",
    latitude: 28.62,
    longitude: 77.21,
    jurisdictionRadiusKm: 25,
    categories: [
      "POTHOLE",
      "DAMAGED_ROAD",
      "DAMAGED_FOOTPATH",
      "ROAD_OBSTRUCTION",
    ] as ComplaintCategory[],
  },
  {
    name: "Sanitation",
    code: "sanitation",
    description: "Garbage, drains, and sanitation services.",
    latitude: 28.61,
    longitude: 77.22,
    jurisdictionRadiusKm: 25,
    categories: [
      "GARBAGE",
      "OVERFLOWING_DUSTBIN",
      "ILLEGAL_DUMPING",
      "BLOCKED_DRAIN",
      "OVERFLOWING_DRAIN",
      "DAMAGED_DRAIN",
    ] as ComplaintCategory[],
  },
  {
    name: "Electrical",
    code: "electrical",
    description: "Street lighting and electrical civic infrastructure.",
    latitude: 28.63,
    longitude: 77.2,
    jurisdictionRadiusKm: 25,
    categories: [
      "BROKEN_STREETLIGHT",
      "FLICKERING_STREETLIGHT",
      "DARK_AREA",
    ] as ComplaintCategory[],
  },
  {
    name: "Water",
    code: "water",
    description: "Water supply, leakage, and quality issues.",
    latitude: 28.6,
    longitude: 77.23,
    jurisdictionRadiusKm: 25,
    categories: [
      "WATER_LEAKAGE",
      "NO_WATER_SUPPLY",
      "CONTAMINATED_WATER",
    ] as ComplaintCategory[],
  },
  {
    name: "Parks",
    code: "parks",
    description: "Parks, trees, and public green spaces.",
    latitude: 28.64,
    longitude: 77.19,
    jurisdictionRadiusKm: 25,
    categories: ["FALLEN_TREE", "OTHER"] as ComplaintCategory[],
  },
] as const;

async function seedFreshDepartments() {
  const created = new Map<string, string>();

  for (const department of DEFAULT_DEPARTMENTS) {
    const row = await prisma.department.create({
      data: {
        name: department.name,
        code: department.code,
        description: department.description,
        latitude: department.latitude,
        longitude: department.longitude,
        jurisdictionRadiusKm: department.jurisdictionRadiusKm,
        supportedCategories: [...department.categories],
        isActive: true,
      },
      select: { id: true, code: true },
    });
    created.set(row.code, row.id);
  }

  for (const department of DEFAULT_DEPARTMENTS) {
    const departmentId = created.get(department.code);
    if (!departmentId) continue;
    for (const category of department.categories) {
      await prisma.categoryRoute.create({
        data: { category, departmentId },
      });
    }
  }
}

async function backfillMissingCategoryRoutes() {
  const existing = await prisma.categoryRoute.findMany({
    select: { category: true },
  });
  const routed = new Set(existing.map((row) => row.category));

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, supportedCategories: true },
  });

  for (const department of departments) {
    for (const category of department.supportedCategories) {
      if (routed.has(category)) continue;
      await prisma.categoryRoute.create({
        data: { category, departmentId: department.id },
      });
      routed.add(category);
    }
  }
}

async function main() {
  const existingCount = await prisma.department.count();
  if (existingCount === 0) {
    await seedFreshDepartments();
  } else {
    await backfillMissingCategoryRoutes();
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

  console.log(
    existingCount === 0
      ? `Seeded ${DEFAULT_DEPARTMENTS.length} departments, category routes, and super admin.`
      : "Departments already exist; missing category routes were backfilled. Names were not changed.",
  );
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

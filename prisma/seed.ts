import { prisma } from "./client";

const DEPARTMENTS = [
  {
    name: "Roads",
    code: "roads",
    description: "Roads, potholes, footpaths, and road obstructions.",
    latitude: 28.62,
    longitude: 77.21,
    jurisdictionRadiusKm: 25,
    supportedCategories: [
      "POTHOLE",
      "DAMAGED_ROAD",
      "DAMAGED_FOOTPATH",
      "ROAD_OBSTRUCTION",
    ],
  },
  {
    name: "Sanitation",
    code: "sanitation",
    description: "Garbage, drains, and sanitation services.",
    latitude: 28.61,
    longitude: 77.22,
    jurisdictionRadiusKm: 25,
    supportedCategories: [
      "GARBAGE",
      "OVERFLOWING_DUSTBIN",
      "ILLEGAL_DUMPING",
      "BLOCKED_DRAIN",
      "OVERFLOWING_DRAIN",
      "DAMAGED_DRAIN",
    ],
  },
  {
    name: "Electrical",
    code: "electrical",
    description: "Street lighting and electrical civic infrastructure.",
    latitude: 28.63,
    longitude: 77.2,
    jurisdictionRadiusKm: 25,
    supportedCategories: [
      "BROKEN_STREETLIGHT",
      "FLICKERING_STREETLIGHT",
      "DARK_AREA",
    ],
  },
  {
    name: "Water",
    code: "water",
    description: "Water supply, leakage, and quality issues.",
    latitude: 28.6,
    longitude: 77.23,
    jurisdictionRadiusKm: 25,
    supportedCategories: [
      "WATER_LEAKAGE",
      "NO_WATER_SUPPLY",
      "CONTAMINATED_WATER",
    ],
  },
  {
    name: "Parks",
    code: "parks",
    description: "Parks, trees, and public green spaces.",
    latitude: 28.64,
    longitude: 77.19,
    jurisdictionRadiusKm: 25,
    supportedCategories: ["FALLEN_TREE", "OTHER"],
  },
] as const;

async function main() {
  for (const department of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { code: department.code },
      update: {
        name: department.name,
        description: department.description,
        latitude: department.latitude,
        longitude: department.longitude,
        jurisdictionRadiusKm: department.jurisdictionRadiusKm,
        supportedCategories: [...department.supportedCategories],
        isActive: true,
      },
      create: {
        name: department.name,
        code: department.code,
        description: department.description,
        latitude: department.latitude,
        longitude: department.longitude,
        jurisdictionRadiusKm: department.jurisdictionRadiusKm,
        supportedCategories: [...department.supportedCategories],
        isActive: true,
      },
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

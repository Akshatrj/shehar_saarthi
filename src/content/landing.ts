export const civicCategories = [
  {
    title: "Roads",
    description: "Potholes, broken pavement, and unsafe stretches of road.",
    image: "/categories/roads.webp",
    imageAlt: "A pothole in a wet city road.",
  },
  {
    title: "Street Lights",
    description: "Dark lanes, flickering lamps, and poles that need repair.",
    image: "/categories/lights.webp",
    imageAlt: "An unlit street lamp on a dark residential lane.",
  },
  {
    title: "Garbage",
    description: "Overflowing bins, missed collection, and illegal dumping.",
    image: "/categories/garbage.webp",
    imageAlt: "An overflowing municipal bin on a street.",
  },
  {
    title: "Drainage",
    description: "Blocked drains, waterlogging, and open manholes.",
    image: "/categories/drainage.webp",
    imageAlt: "A blocked roadside drain with standing rainwater.",
  },
  {
    title: "Water",
    description: "Leaks, contamination reports, and supply disruptions.",
    image: "/categories/water.webp",
    imageAlt: "A leaking municipal water pipe on a wet street.",
  },
  {
    title: "Public Infrastructure",
    description: "Parks, footpaths, bus stops, and damaged civic property.",
    image: "/categories/infrastructure.webp",
    imageAlt: "A damaged footpath beside a worn bus stop.",
  },
] as const;

export const workflowSteps = [
  {
    title: "Report",
    description: "Photograph the issue, describe it, and pin the location.",
  },
  {
    title: "AI Verification",
    description: "Checks the image and description so the record is usable.",
  },
  {
    title: "Smart Assignment",
    description: "Routes the complaint to the right municipal department.",
  },
  {
    title: "Resolution",
    description: "Field teams work the job and mark it complete.",
  },
  {
    title: "Citizen Verification",
    description: "You confirm the fix — or reopen it if the problem remains.",
  },
] as const;

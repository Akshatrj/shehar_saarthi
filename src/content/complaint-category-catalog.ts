import type { ComplaintCategory } from "@/domains/complaints/types";

export type ComplaintCategoryGroup = {
  id: string;
  title: string;
  categories: {
    value: ComplaintCategory;
    label: string;
    description: string;
  }[];
};

/** Citizen-facing complaint categories grouped for the report form. */
export const COMPLAINT_CATEGORY_CATALOG: ComplaintCategoryGroup[] = [
  {
    id: "roads",
    title: "Roads & Infrastructure",
    categories: [
      { value: "POTHOLE", label: "Pothole", description: "Holes or damage in the road surface." },
      {
        value: "DAMAGED_ROAD",
        label: "Damaged Road",
        description: "Cracks, broken asphalt, or unsafe road surface.",
      },
      {
        value: "DAMAGED_FOOTPATH",
        label: "Damaged Footpath",
        description: "Broken tiles, uneven walkways, or unsafe footpaths.",
      },
      {
        value: "ROAD_OBSTRUCTION",
        label: "Road Obstruction",
        description: "Blocked lanes, debris, or obstacles on the road.",
      },
    ],
  },
  {
    id: "lighting",
    title: "Street Lighting",
    categories: [
      {
        value: "BROKEN_STREETLIGHT",
        label: "Broken Street Light",
        description: "A street light that is not working.",
      },
      {
        value: "FLICKERING_STREETLIGHT",
        label: "Flickering Street Light",
        description: "Intermittent or unstable street lighting.",
      },
      {
        value: "DARK_AREA",
        label: "Dark Area / No Street Lighting",
        description: "Poorly lit lanes or missing street lights.",
      },
    ],
  },
  {
    id: "sanitation",
    title: "Sanitation",
    categories: [
      {
        value: "GARBAGE",
        label: "Garbage Not Collected",
        description: "Missed waste collection or uncollected garbage.",
      },
      {
        value: "OVERFLOWING_DUSTBIN",
        label: "Overflowing Dustbin",
        description: "Bins overflowing onto streets or sidewalks.",
      },
      {
        value: "ILLEGAL_DUMPING",
        label: "Illegal Dumping",
        description: "Unauthorized waste dumping in public areas.",
      },
    ],
  },
  {
    id: "water",
    title: "Water",
    categories: [
      {
        value: "WATER_LEAKAGE",
        label: "Water Leakage",
        description: "Leaking pipes, valves, or water mains.",
      },
      {
        value: "NO_WATER_SUPPLY",
        label: "No Water Supply",
        description: "No water or prolonged supply disruption.",
      },
      {
        value: "CONTAMINATED_WATER",
        label: "Contaminated Water",
        description: "Discoloured, foul, or unsafe water supply.",
      },
    ],
  },
  {
    id: "drainage",
    title: "Drainage",
    categories: [
      {
        value: "BLOCKED_DRAIN",
        label: "Blocked Drain",
        description: "Clogged drains causing waterlogging.",
      },
      {
        value: "OVERFLOWING_DRAIN",
        label: "Overflowing Drain",
        description: "Drains overflowing onto streets.",
      },
      {
        value: "DAMAGED_DRAIN",
        label: "Damaged Drain",
        description: "Broken or open drain infrastructure.",
      },
    ],
  },
  {
    id: "other",
    title: "Other",
    categories: [
      {
        value: "FALLEN_TREE",
        label: "Fallen Tree / Parks",
        description: "Fallen trees or park maintenance issues.",
      },
      {
        value: "OTHER",
        label: "Other Civic Issue",
        description: "Any other municipal issue not listed above.",
      },
    ],
  },
];

export const ALL_CATALOG_CATEGORIES = COMPLAINT_CATEGORY_CATALOG.flatMap(
  (group) => group.categories.map((item) => item.value),
);

export function catalogGroupForCategory(category: ComplaintCategory | null) {
  if (!category) {
    return null;
  }
  return (
    COMPLAINT_CATEGORY_CATALOG.find((group) =>
      group.categories.some((item) => item.value === category),
    ) ?? null
  );
}

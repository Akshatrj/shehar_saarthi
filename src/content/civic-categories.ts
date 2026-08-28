import {
  Building2,
  Construction,
  Droplets,
  Lightbulb,
  TrafficCone,
  Trash2,
  Trees,
  Waves,
  type LucideIcon,
} from "lucide-react";

/** Landing-page civic themes. These ids are not Department records. */
export type CivicCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  imageSrc: string;
  imageAlt: string;
};

export const reportCategories: CivicCategory[] = [
  {
    id: "roads",
    title: "Roads & Potholes",
    description: "Report damaged roads, potholes, and unsafe road conditions.",
    icon: Construction,
    imageSrc: "/images/categories/category-roads-potholes.webp",
    imageAlt: "Damaged asphalt road with a large water-filled pothole",
  },
  {
    id: "water",
    title: "Water Supply",
    description: "Report leaks, low pressure, and water supply disruptions.",
    icon: Droplets,
    imageSrc: "/images/categories/category-water-supply.webp",
    imageAlt: "Leaking municipal water pipe spraying onto a wet street",
  },
  {
    id: "lights",
    title: "Street Lights",
    description: "Report dark lanes, broken lamps, and faulty street lighting.",
    icon: Lightbulb,
    imageSrc: "/images/categories/category-street-lights.webp",
    imageAlt: "Dark urban lane with a broken, unlit street lamp at night",
  },
  {
    id: "garbage",
    title: "Garbage & Sanitation",
    description: "Report missed collection, overflowing bins, and dumping.",
    icon: Trash2,
    imageSrc: "/images/categories/category-garbage-sanitation.webp",
    imageAlt: "Overflowing public garbage bins spilling waste onto a sidewalk",
  },
  {
    id: "drainage",
    title: "Drainage",
    description: "Report blocked drains, waterlogging, and open manholes.",
    icon: Waves,
    imageSrc: "/images/categories/category-drainage.webp",
    imageAlt: "Blocked roadside drain overflowing with stagnant floodwater",
  },
  {
    id: "parks",
    title: "Parks & Public Spaces",
    description: "Report damaged parks, footpaths, and public amenities.",
    icon: Trees,
    imageSrc: "/images/categories/category-parks.webp",
    imageAlt: "Neglected public park with overgrown grass and a damaged bench",
  },
  {
    id: "traffic",
    title: "Traffic & Signals",
    description: "Report broken signals, unsafe crossings, and traffic hazards.",
    icon: TrafficCone,
    imageSrc: "/images/categories/category-traffic-signals.webp",
    imageAlt: "Broken unlit traffic signal hanging over an empty intersection",
  },
  {
    id: "other",
    title: "Other Civic Issues",
    description: "Report any other municipal issue that needs attention.",
    icon: Building2,
    imageSrc: "/images/categories/category-other-civic.webp",
    imageAlt: "Municipal civic office building with a public courtyard",
  },
];

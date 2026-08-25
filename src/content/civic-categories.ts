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

export type CivicCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const reportCategories: CivicCategory[] = [
  {
    id: "roads",
    title: "Roads & Potholes",
    description: "Report damaged roads, potholes, and unsafe road conditions.",
    icon: Construction,
  },
  {
    id: "water",
    title: "Water Supply",
    description: "Report leaks, low pressure, and water supply disruptions.",
    icon: Droplets,
  },
  {
    id: "lights",
    title: "Street Lights",
    description: "Report dark lanes, broken lamps, and faulty street lighting.",
    icon: Lightbulb,
  },
  {
    id: "garbage",
    title: "Garbage & Sanitation",
    description: "Report missed collection, overflowing bins, and dumping.",
    icon: Trash2,
  },
  {
    id: "drainage",
    title: "Drainage",
    description: "Report blocked drains, waterlogging, and open manholes.",
    icon: Waves,
  },
  {
    id: "parks",
    title: "Parks & Public Spaces",
    description: "Report damaged parks, footpaths, and public amenities.",
    icon: Trees,
  },
  {
    id: "traffic",
    title: "Traffic & Signals",
    description: "Report broken signals, unsafe crossings, and traffic hazards.",
    icon: TrafficCone,
  },
  {
    id: "other",
    title: "Other Civic Issues",
    description: "Report any other municipal issue that needs attention.",
    icon: Building2,
  },
];

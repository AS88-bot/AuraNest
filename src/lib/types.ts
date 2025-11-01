import type { LucideIcon } from "lucide-react";

export type PlannerCategory = "appointment" | "medication" | "meal" | "activity";

export type IconName = "Pill" | "Utensils" | "Calendar" | "Smile";

export interface PlannerItem {
  id: string;
  time: string;
  title: string;
  category: PlannerCategory;
  description: string;
  icon: IconName;
  image?: string; 
  isCompleted: boolean;
}

export interface Contact {
  id: string;
  name: string;
  relation: string;
  avatar: string;
}

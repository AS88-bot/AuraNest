import type { LucideIcon } from "lucide-react";

export type PlannerCategory = "appointment" | "medication" | "meal" | "activity";

export type IconName = "Pill" | "Utensils" | "Calendar" | "Smile";

export interface PlannerItem {
  id: string;
  time: string;
  titleKey: string;
  category: PlannerCategory;
  descriptionKey: string;
  icon: IconName;
  image?: string; 
  isCompleted: boolean;
  onUpdate?: (updatedItem: PlannerItem) => void;
}

export interface Contact {
  id: string;
  name: string;
  relationKey: string;
  avatar: string;
  phone?: string;
}

    
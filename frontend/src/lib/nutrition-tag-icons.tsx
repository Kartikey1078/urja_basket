import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Bean,
  Citrus,
  Dumbbell,
  Flame,
  Leaf,
  Salad,
  Sparkles,
  Wheat,
  Zap,
} from "lucide-react";

type IconRule = {
  keywords: string[];
  icon: LucideIcon;
};

const ICON_RULES: IconRule[] = [
  { keywords: ["vitamin c", "citrus"], icon: Citrus },
  { keywords: ["vitamin k", "vitamin a", "vitamin"], icon: Leaf },
  { keywords: ["protein", "amino"], icon: Dumbbell },
  { keywords: ["fiber", "fibre", "roughage"], icon: Wheat },
  { keywords: ["iron", "mineral"], icon: Zap },
  { keywords: ["calcium", "bone"], icon: Bean },
  { keywords: ["antioxidant", "omega"], icon: Sparkles },
  { keywords: ["low calorie", "calorie", "energy"], icon: Flame },
  { keywords: ["organic", "natural", "plant"], icon: Salad },
];

const DEFAULT_ICON = Apple;

/** Pick an icon from tag label keywords (icons are inferred, tags come from product data). */
export function getNutritionTagIcon(tag: string): LucideIcon {
  const normalized = tag.toLowerCase();
  for (const rule of ICON_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.icon;
    }
  }
  return DEFAULT_ICON;
}

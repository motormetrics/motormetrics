import coeSectionBones from "@web/bones/coe-section.bones.json";
import marketOverviewBones from "@web/bones/market-overview.bones.json";
import monthlyChangeSummaryBones from "@web/bones/monthly-change-summary.bones.json";
import postsSectionBones from "@web/bones/posts-section.bones.json";
import summaryCardBones from "@web/bones/summary-card.bones.json";
import topMakesBones from "@web/bones/top-makes.bones.json";
import yearlyChartBones from "@web/bones/yearly-chart.bones.json";
import type { BonesInput } from "./bones-skeleton";
import { BonesSkeleton } from "./bones-skeleton";

const BONE_FALLBACKS = {
  "coe-section": coeSectionBones,
  "market-overview": marketOverviewBones,
  "monthly-change-summary": monthlyChangeSummaryBones,
  "posts-section": postsSectionBones,
  "summary-card": summaryCardBones,
  "top-makes": topMakesBones,
  "yearly-chart": yearlyChartBones,
} as const satisfies Record<string, BonesInput>;

export type BoneName = keyof typeof BONE_FALLBACKS;

const DEFAULT_CLASS_NAME: Partial<Record<BoneName, string>> = {
  "monthly-change-summary": "overflow-hidden rounded-2xl bg-surface",
  "summary-card": "overflow-hidden rounded-2xl bg-surface",
};

interface BonesFallbackProps {
  name: BoneName;
  className?: string;
}

export function BonesFallback({ name, className }: BonesFallbackProps) {
  return (
    <BonesSkeleton
      bones={BONE_FALLBACKS[name]}
      className={className ?? DEFAULT_CLASS_NAME[name]}
    />
  );
}

import annualHeaderMetaBones from "@web/bones/annual-header-meta.bones.json";
import carsRegistrationsCompareBones from "@web/bones/cars-registrations-compare.bones.json";
import carsRegistrationsSectionsBones from "@web/bones/cars-registrations-sections.bones.json";
import categoryOverviewContentBones from "@web/bones/category-overview-content.bones.json";
import coeSectionBones from "@web/bones/coe-section.bones.json";
import deregistrationsContentBones from "@web/bones/deregistrations-content.bones.json";
import makeDetailBones from "@web/bones/make-detail.bones.json";
import makesContentBones from "@web/bones/makes-content.bones.json";
import marketOverviewBones from "@web/bones/market-overview.bones.json";
import metricCardsBones from "@web/bones/metric-cards.bones.json";
import monthlyChangeSummaryBones from "@web/bones/monthly-change-summary.bones.json";
import pageHeaderMetaBones from "@web/bones/page-header-meta.bones.json";
import postsSectionBones from "@web/bones/posts-section.bones.json";
import summaryCardBones from "@web/bones/summary-card.bones.json";
import topMakesBones from "@web/bones/top-makes.bones.json";
import topMakesFuelBones from "@web/bones/top-makes-fuel.bones.json";
import yearlyChartBones from "@web/bones/yearly-chart.bones.json";
import type { BonesInput } from "./bones-skeleton";
import { BonesSkeleton } from "./bones-skeleton";

const BONE_FALLBACKS = {
  "annual-header-meta": annualHeaderMetaBones,
  "cars-registrations-compare": carsRegistrationsCompareBones,
  "cars-registrations-sections": carsRegistrationsSectionsBones,
  "category-overview-content": categoryOverviewContentBones,
  "coe-section": coeSectionBones,
  "deregistrations-content": deregistrationsContentBones,
  "make-detail": makeDetailBones,
  "makes-content": makesContentBones,
  "market-overview": marketOverviewBones,
  "metric-cards": metricCardsBones,
  "monthly-change-summary": monthlyChangeSummaryBones,
  "page-header-meta": pageHeaderMetaBones,
  "posts-section": postsSectionBones,
  "summary-card": summaryCardBones,
  "top-makes": topMakesBones,
  "top-makes-fuel": topMakesFuelBones,
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

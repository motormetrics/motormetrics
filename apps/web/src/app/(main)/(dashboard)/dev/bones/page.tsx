import {
  BONE_FALLBACKS,
  type BoneName,
  BonesFallback,
} from "@web/components/shared/bones-fallback";
import Typography from "@web/components/typography";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Bones preview",
  robots: { index: false, follow: false },
};

const BONE_NAMES = Object.keys(BONE_FALLBACKS) as BoneName[];

export default function BonesPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex max-w-3xl flex-col gap-2">
        <Typography.H1>Bones preview</Typography.H1>
        <Typography.TextLg className="text-muted">
          Cached pages stay in the static shell, so their Suspense fallbacks
          often never paint. This page always renders the captured bones.
        </Typography.TextLg>
      </div>
      <div className="flex flex-col gap-10">
        {BONE_NAMES.map((name) => (
          <div key={name} className="flex flex-col gap-3">
            <Typography.H3 className="font-mono text-sm">{name}</Typography.H3>
            <BonesFallback name={name} />
          </div>
        ))}
      </div>
    </section>
  );
}

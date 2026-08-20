import { cn } from "@heroui/react";
import type { ReactNode } from "react";

/** Skip icon paths and canvases during CLI capture. */
export const BONES_SNAPSHOT_CONFIG = JSON.stringify({
  excludeSelectors: ["svg", "canvas"],
});

interface BonesCaptureProps {
  name: string;
  children: ReactNode;
  className?: string;
}

/** Marks real UI for `npx boneyard-js build` without using the client Skeleton. */
export function BonesCapture({ name, children, className }: BonesCaptureProps) {
  return (
    <div
      className={className}
      data-boneyard={name}
      data-boneyard-config={BONES_SNAPSHOT_CONFIG}
    >
      {children}
    </div>
  );
}

type BoneObject = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number | string;
  c?: boolean;
};

type CompactBone = Array<number | string | boolean>;

export type BonesResult = {
  name?: string;
  viewportWidth?: number;
  width: number;
  height: number;
  bones: Array<CompactBone | BoneObject>;
};

export type ResponsiveBones = {
  breakpoints: Record<string | number, BonesResult>;
  _hash?: string;
};

export type BonesInput = BonesResult | ResponsiveBones;

interface BonesSkeletonProps {
  bones: BonesInput;
  className?: string;
}

function isResponsive(bones: BonesInput): bones is ResponsiveBones {
  return "breakpoints" in bones && bones.breakpoints != null;
}

function normalizeBone(raw: CompactBone | BoneObject): BoneObject {
  if (Array.isArray(raw)) {
    return {
      x: Number(raw[0]),
      y: Number(raw[1]),
      w: Number(raw[2]),
      h: Number(raw[3]),
      r: raw[4] as number | string,
      c: Boolean(raw[5]),
    };
  }

  return raw;
}

function skeletonName(bones: BonesInput): string {
  if (isResponsive(bones)) {
    const first = Object.values(bones.breakpoints)[0];
    return first?.name ?? "bones";
  }

  return bones.name ?? "bones";
}

function breakpointCss(uid: string, widths: number[]): string {
  return widths
    .map((width, index) => {
      const nextWidth = widths[index + 1];
      const selector = `.${uid}-${width}`;

      if (nextWidth == null && index === 0) {
        return `${selector}{display:block}`;
      }

      if (index === 0) {
        return `${selector}{display:block}@media (min-width:${nextWidth}px){${selector}{display:none}}`;
      }

      if (nextWidth == null) {
        return `${selector}{display:none}@media (min-width:${width}px){${selector}{display:block}}`;
      }

      return `${selector}{display:none}@media (min-width:${width}px){${selector}{display:block}}@media (min-width:${nextWidth}px){${selector}{display:none}}`;
    })
    .join("");
}

function BreakpointBones({ result }: { result: BonesResult }) {
  return (
    <div
      aria-hidden
      className="relative w-full overflow-hidden"
      style={{ height: result.height }}
    >
      {result.bones.map((raw, index) => {
        const bone = normalizeBone(raw);
        const capturedPxW = (bone.w / 100) * (result.width || 0);
        const isCircle = bone.r === "50%" && Math.abs(capturedPxW - bone.h) < 4;

        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: bones are a static captured list
            key={index}
            className={cn(
              "absolute",
              bone.c ? "bg-surface" : "animate-pulse bg-default",
            )}
            style={{
              left: `${bone.x}%`,
              top: bone.y,
              width: isCircle ? bone.h : `${bone.w}%`,
              height: bone.h,
              borderRadius: typeof bone.r === "string" ? bone.r : `${bone.r}px`,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Server Component skeleton from Boneyard capture JSON.
 * Renders all breakpoints into the static shell and switches with CSS.
 */
export function BonesSkeleton({ bones, className }: BonesSkeletonProps) {
  const entries = isResponsive(bones)
    ? Object.entries(bones.breakpoints)
        .map(([width, result]) => [Number(width), result] as const)
        .sort((left, right) => left[0] - right[0])
    : ([[0, bones]] as const);

  if (entries.length === 0) {
    return null;
  }

  const uid = skeletonName(bones).replaceAll(/[^a-zA-Z0-9_-]/g, "-");
  const widths = entries.map(([width]) => width);

  return (
    <div className={className}>
      <style href={`bones-${uid}`}>{breakpointCss(uid, widths)}</style>
      {entries.map(([width, result]) => (
        <div key={width} className={`${uid}-${width}`}>
          <BreakpointBones result={result} />
        </div>
      ))}
    </div>
  );
}

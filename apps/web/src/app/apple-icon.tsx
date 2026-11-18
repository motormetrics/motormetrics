import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/* The standard mark: the bars on a white ground. iOS fills transparency with
   black and applies its own corner mask, so the ground is opaque and square.
   The bars carry the same 2/3 inset as public/brand/motormetrics-mark.svg,
   which keeps them clear of every platform's crop. */
export default function AppleIcon() {
  return new ImageResponse(
    <svg
      aria-label="MotorMetrics"
      height={size.height}
      role="img"
      viewBox="0 0 64 64"
      width={size.width}
    >
      <rect fill="#FFFFFF" height="64" width="64" />
      <g transform="translate(10.667 10.667) scale(0.66667)">
        <rect fill="#062F5C" height="44" rx="4" width="8" x="4" y="10" />
        <rect fill="#0961BB" height="30" rx="4" width="8" x="16" y="24" />
        <rect fill="#0961BB" height="18" rx="4" width="8" x="28" y="36" />
        <rect fill="#0961BB" height="30" rx="4" width="8" x="40" y="24" />
        <rect fill="#062F5C" height="44" rx="4" width="8" x="52" y="10" />
      </g>
    </svg>,
    size,
  );
}

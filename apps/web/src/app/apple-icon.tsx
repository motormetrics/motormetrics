import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/* The standard mark: the two-tone arches on the Glass page grey. iOS fills
   transparency with black and applies its own corner mask, so the ground is
   opaque and square. The arches carry the same 2/3 inset as
   public/brand/motormetrics-mark.svg, which leaves a quarter of the tile
   clear on every side so no platform's crop can bite into them. */
export default function AppleIcon() {
  return new ImageResponse(
    <svg
      aria-label="MotorMetrics"
      fill="none"
      height={size.height}
      role="img"
      viewBox="0 0 64 64"
      width={size.width}
    >
      <rect fill="#F4F5F7" height="64" width="64" />
      <g transform="translate(10.667 9.333) scale(0.66667)">
        <path
          d="M8 50 V30 a12 12 0 0 1 24 0 V50"
          stroke="#2B2E31"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7"
        />
        <path
          d="M32 50 V30 a12 12 0 0 1 24 0 V50"
          stroke="#57768C"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7"
        />
      </g>
    </svg>,
    size,
  );
}

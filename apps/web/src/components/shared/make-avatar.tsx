import { cn } from "@heroui/react";
import Image from "next/image";

/**
 * Brand disc used by every make in the layout.
 *
 * Falls back to the make's initial on an accent-soft circle, as the comp does —
 * logo coverage is incomplete, and a missing image would otherwise read as a
 * hole in the row rather than a brand without a mark.
 */
export function MakeAvatar({
  className,
  logoUrl,
  make,
  size,
}: {
  className?: string;
  logoUrl: string | null;
  make: string;
  /** Diameter in pixels; the monogram scales with it. */
  size: number;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/15 font-extrabold text-accent-strong leading-none",
        className,
      )}
      style={{
        fontSize: `${Math.round(size * 0.38)}px`,
        height: `${size}px`,
        width: `${size}px`,
      }}
    >
      {logoUrl ? (
        <Image
          alt={`${make} logo`}
          className="size-[78%] object-contain"
          height={size}
          src={logoUrl}
          width={size}
        />
      ) : (
        <span aria-hidden>{make.charAt(0).toUpperCase()}</span>
      )}
    </span>
  );
}

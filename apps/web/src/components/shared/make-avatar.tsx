import { Avatar } from "@heroui/react";
import Image from "next/image";

/** Rendered widths of HeroUI Avatar's sizes, so next/image fetches the right width. */
const IMAGE_SIZES = { sm: "32px", md: "40px", lg: "48px" } as const;

/**
 * Brand disc used by every make in the layout.
 *
 * A plain HeroUI Avatar: its own sizes, token radius and default colours.
 * Without a logo it shows HeroUI's default grey monogram — logo coverage is
 * incomplete, and a missing image would otherwise read as a hole in the row
 * rather than a brand without a mark.
 */
export function MakeAvatar({
  className,
  logoUrl,
  make,
  size = "md",
}: {
  /** Layout only (spacing, placement). */
  className?: string;
  logoUrl: string | null;
  make: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Avatar className={className} size={size}>
      {logoUrl ? (
        // object-contain: brand marks are not square and must not be cropped.
        <Image
          alt={`${make} logo`}
          className="object-contain"
          fill
          sizes={IMAGE_SIZES[size]}
          src={logoUrl}
        />
      ) : (
        <Avatar.Fallback aria-hidden>
          {make.charAt(0).toUpperCase()}
        </Avatar.Fallback>
      )}
    </Avatar>
  );
}

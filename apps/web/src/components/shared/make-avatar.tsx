import { Avatar } from "@heroui/react";
import Image from "next/image";

/**
 * Logo box per HeroUI Avatar size, about 75% of its 32/40/48px square. The
 * inset keeps brand marks off the avatar's rounded, overflow-hidden corners,
 * which would otherwise clip any logo drawn to its edge.
 */
const LOGO_SIZES = { sm: 24, md: 30, lg: 36 } as const;

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
          height={LOGO_SIZES[size]}
          src={logoUrl}
          width={LOGO_SIZES[size]}
        />
      ) : (
        <Avatar.Fallback aria-hidden>
          {make.charAt(0).toUpperCase()}
        </Avatar.Fallback>
      )}
    </Avatar>
  );
}

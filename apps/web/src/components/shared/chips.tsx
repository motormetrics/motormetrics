import { Chip } from "@heroui/react";
export function NewChip() {
  return (
    <Chip color="accent" size="sm" variant="primary">
      New
    </Chip>
  );
}

export function BetaChip() {
  return (
    <Chip color="warning" size="sm" variant="primary">
      Beta
    </Chip>
  );
}

/** The chip for a navigation item's `badge`, or nothing when it has none. */
export function NavBadge({ badge }: { badge?: "beta" | "new" }) {
  if (badge === "new") {
    return <NewChip />;
  }
  if (badge === "beta") {
    return <BetaChip />;
  }
  return null;
}

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

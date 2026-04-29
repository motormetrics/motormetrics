import { Chip } from "@heroui/chip";

export function NewChip() {
  return (
    <Chip color="primary" size="sm">
      New
    </Chip>
  );
}

export function BetaChip() {
  return (
    <Chip color="warning" size="sm" variant="flat">
      Beta
    </Chip>
  );
}

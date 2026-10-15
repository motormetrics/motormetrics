"use client";

import { Button } from "@heroui/react";
import { RotateCcw } from "lucide-react";

/** Steps back through browser history, which needs the client. */
export function GoBackButton() {
  return (
    <Button variant="outline" onPress={() => history.back()}>
      <RotateCcw className="size-4" />
      Go Back
    </Button>
  );
}

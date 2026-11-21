"use client";

import { Button, type ButtonProps } from "@heroui/react";
import { useRouter } from "next/navigation";

/**
 * A button that navigates in the browser. The makes index uses it for the
 * detail panel's `?make=` and `?compare=` views and the comparison picks, so
 * those URLs never appear as links in the HTML for a crawler to walk.
 */
export function NavButton({
  href,
  scroll = true,
  ...props
}: Omit<ButtonProps, "onPress"> & { href: string; scroll?: boolean }) {
  const router = useRouter();

  return <Button {...props} onPress={() => router.push(href, { scroll })} />;
}

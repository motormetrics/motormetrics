"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider
        placement="top-right"
        toastProps={{
          timeout: 6000,
          hideCloseButton: false,
        }}
      />
      {children}
    </HeroUIProvider>
  );
}

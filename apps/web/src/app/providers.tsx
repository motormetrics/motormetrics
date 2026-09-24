"use client";

import { Toast } from "@heroui/react";
import type { ReactNode } from "react";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Toast.Provider placement="bottom end" />
      {children}
    </>
  );
}

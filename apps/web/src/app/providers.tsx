"use client";

import { Toast } from "@heroui/react";
import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

export function Providers({
  children,
  locale,
  messages,
}: Readonly<{
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}>) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Toast.Provider placement="bottom end" />
      {children}
    </NextIntlClientProvider>
  );
}

"use client";

import type { Key } from "@heroui/react";

import { Button, Dropdown, Header, Label, Separator } from "@heroui/react";
import { SiTelegram, SiWhatsapp, SiX } from "@icons-pack/react-simple-icons";
import { SITE_URL } from "@web/config";
import { Check, Link2, Linkedin, Share2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const COPY_KEY = "copy";

/** How long "Link copied" stays up before the row reverts. */
const COPIED_RESET_MS = 2000;

const TARGETS = [
  {
    build: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    icon: SiWhatsapp,
    label: "WhatsApp",
  },
  {
    build: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    icon: SiTelegram,
    label: "Telegram",
  },
  {
    build: (url: string, title: string) =>
      `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    icon: SiX,
    label: "X",
  },
  {
    build: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    icon: Linkedin,
    label: "LinkedIn",
  },
] as const;

/**
 * The comps' single accent "Share" pill, which opens a menu of targets over a
 * copy-link row.
 *
 * The blog's `ShareButtons` lays the same four targets out as a row of icon
 * buttons, which suits an article footer but not the page head, where the comp
 * budgets one control's width beside the month picker.
 */
export function SharePill({ title }: { title: string }) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const url = `${SITE_URL}${pathname}`;

  const handleAction = async (key: Key) => {
    if (key === COPY_KEY) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
      return;
    }

    window.open(String(key), "_blank", "noopener,noreferrer");
  };

  return (
    <Dropdown>
      <Button
        className="h-auto gap-2.5 rounded-full bg-accent px-6 py-3.5 font-bold text-accent-foreground text-sm transition-[filter] hover:brightness-105"
        variant="tertiary"
      >
        <Share2 className="size-4 shrink-0" strokeWidth={2} />
        Share
      </Button>
      <Dropdown.Popover className="min-w-58" placement="bottom end">
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Section>
            <Header>Share this page</Header>
            {TARGETS.map(({ build, icon: Icon, label }) => (
              <Dropdown.Item
                id={build(url, title)}
                key={label}
                textValue={label}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Icon className="size-4" />
                </span>
                <Label>{label}</Label>
              </Dropdown.Item>
            ))}
          </Dropdown.Section>
          <Separator />
          <Dropdown.Section>
            <Dropdown.Item
              id={COPY_KEY}
              textValue={copied ? "Link copied" : "Copy link"}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                {copied ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Link2 className="size-4" />
                )}
              </span>
              <Label className="font-bold text-accent">
                {copied ? "Link copied" : "Copy link"}
              </Label>
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

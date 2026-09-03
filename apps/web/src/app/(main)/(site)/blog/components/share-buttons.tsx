"use client";

import { Button, Tooltip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { SiTelegram, SiWhatsapp, SiX } from "@icons-pack/react-simple-icons";
import { SITE_URL } from "@web/config";
import { Check, Copy, Linkedin, Share2 } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `${SITE_URL}${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  function trackShare(channel: string) {
    posthog.capture("page_shared", { channel, content_type: "blog" });
  }

  async function copyLink() {
    trackShare("copy");
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
    trackShare("native");
    await navigator.share({ title, url: fullUrl });
  }

  const xUrl = `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${fullUrl}`)}`;

  return (
    <div className="flex items-center gap-2">
      {/* Native share on mobile */}
      <div className="flex md:hidden">
        <Tooltip delay={300}>
          <Button
            className="size-10"
            variant="tertiary"
            isIconOnly
            onPress={nativeShare}
            aria-label="Share article"
          >
            <Share2 className="size-4" />
          </Button>
          <Tooltip.Content>Share article</Tooltip.Content>
        </Tooltip>
      </div>

      {/* Individual buttons on desktop */}
      <div className="hidden items-center gap-2 md:flex">
        <Tooltip delay={300}>
          <Button
            className="size-10"
            variant="tertiary"
            isIconOnly
            onPress={copyLink}
            aria-label={copied ? "Link copied" : "Copy link"}
          >
            {copied ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
          <Tooltip.Content>
            {copied ? "Link copied" : "Copy link"}
          </Tooltip.Content>
        </Tooltip>
        <Tooltip delay={300}>
          <Link
            aria-label="Share on LinkedIn"
            className={buttonVariants({
              className: "size-10",
              isIconOnly: true,
              variant: "tertiary",
            })}
            href={linkedinUrl}
            onClick={() => trackShare("linkedin")}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Linkedin className="size-4" />
          </Link>
          <Tooltip.Content>Share on LinkedIn</Tooltip.Content>
        </Tooltip>
        <Tooltip delay={300}>
          <Link
            aria-label="Share on Telegram"
            className={buttonVariants({
              className: "size-10",
              isIconOnly: true,
              variant: "tertiary",
            })}
            href={telegramUrl}
            onClick={() => trackShare("telegram")}
            rel="noopener noreferrer"
            target="_blank"
          >
            <SiTelegram className="size-4" />
          </Link>
          <Tooltip.Content>Share on Telegram</Tooltip.Content>
        </Tooltip>
        <Tooltip delay={300}>
          <Link
            aria-label="Share on WhatsApp"
            className={buttonVariants({
              className: "size-10",
              isIconOnly: true,
              variant: "tertiary",
            })}
            href={whatsappUrl}
            onClick={() => trackShare("whatsapp")}
            rel="noopener noreferrer"
            target="_blank"
          >
            <SiWhatsapp className="size-4" />
          </Link>
          <Tooltip.Content>Share on WhatsApp</Tooltip.Content>
        </Tooltip>
        <Tooltip delay={300}>
          <Link
            aria-label="Share on X"
            className={buttonVariants({
              className: "size-10",
              isIconOnly: true,
              variant: "tertiary",
            })}
            href={xUrl}
            onClick={() => trackShare("x")}
            rel="noopener noreferrer"
            target="_blank"
          >
            <SiX className="size-4" />
          </Link>
          <Tooltip.Content>Share on X</Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import {
  SiLinkedin,
  SiTelegram,
  SiWhatsapp,
  SiX,
} from "@icons-pack/react-simple-icons";
import { SITE_URL } from "@web/config";
import { Check, Copy, Share2 } from "lucide-react";
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

  async function copyLink() {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
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
        <Tooltip content="Share">
          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onPress={nativeShare}
            aria-label="Share"
          >
            <Share2 className="size-4" />
          </Button>
        </Tooltip>
      </div>

      {/* Individual buttons on desktop */}
      <div className="hidden items-center gap-2 md:flex">
        <Tooltip content={copied ? "Copied!" : "Copy link"}>
          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onPress={copyLink}
            aria-label="Copy link"
          >
            {copied ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </Tooltip>
        <Tooltip content="Share on X">
          <Button
            as="a"
            size="sm"
            variant="flat"
            isIconOnly
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
          >
            <SiX className="size-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Share on LinkedIn">
          <Button
            as="a"
            size="sm"
            variant="flat"
            isIconOnly
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
          >
            <SiLinkedin className="size-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Share on Telegram">
          <Button
            as="a"
            size="sm"
            variant="flat"
            isIconOnly
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Telegram"
          >
            <SiTelegram className="size-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Share on WhatsApp">
          <Button
            as="a"
            size="sm"
            variant="flat"
            isIconOnly
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on WhatsApp"
          >
            <SiWhatsapp className="size-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

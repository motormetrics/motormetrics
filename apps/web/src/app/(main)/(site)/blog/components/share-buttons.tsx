"use client";

import { Button } from "@heroui/react";

import { SiTelegram, SiWhatsapp, SiX } from "@icons-pack/react-simple-icons";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

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
        <Button
          size="sm"
          variant="tertiary"
          isIconOnly
          onPress={nativeShare}
          aria-label="Share"
        >
          <Share2 className="size-4" />
        </Button>
      </div>

      {/* Individual buttons on desktop */}
      <div className="hidden items-center gap-2 md:flex">
        <Button
          size="sm"
          variant="tertiary"
          isIconOnly
          onPress={copyLink}
          aria-label={copied ? "Copied!" : "Copy link"}
        >
          {copied ? (
            <Check className="size-4 text-success" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on X"
        >
          <Button
            size="sm"
            variant="tertiary"
            isIconOnly
            aria-label="Share on X"
          >
            <SiX className="size-4" />
          </Button>
        </a>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on LinkedIn"
        >
          <Button
            size="sm"
            variant="tertiary"
            isIconOnly
            aria-label="Share on LinkedIn"
          >
            <LinkedinIcon className="size-4" />
          </Button>
        </a>
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on Telegram"
        >
          <Button
            size="sm"
            variant="tertiary"
            isIconOnly
            aria-label="Share on Telegram"
          >
            <SiTelegram className="size-4" />
          </Button>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on WhatsApp"
        >
          <Button
            size="sm"
            variant="tertiary"
            isIconOnly
            aria-label="Share on WhatsApp"
          >
            <SiWhatsapp className="size-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}

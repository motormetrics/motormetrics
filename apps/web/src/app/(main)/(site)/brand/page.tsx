import { Card, Typography } from "@heroui/react";
import {
  LogoMark,
  MARK_ACCENT,
  MARK_ACCENT_ON_DARK,
  MARK_INK,
  Wordmark,
} from "@web/components/brand-logo";
import {
  Hairline,
  OverviewPage,
  SectionHead,
} from "@web/components/shared/overview";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  baseOpenGraph,
  baseTwitter,
  siteCardImages,
} from "@web/lib/metadata/social";
import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";

const title = `${SITE_TITLE} logo & wordmark`;
const description =
  "How the MotorMetrics logo and wordmark are drawn, coloured and used: lockups, clear space, minimum sizes and what not to do.";

export const metadata: Metadata = {
  title: "Brand",
  description,
  openGraph: {
    ...baseOpenGraph,
    images: siteCardImages,
    title,
    description,
    url: `${SITE_URL}/brand`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: { canonical: "/brand" },
};

const INK_SURFACE = "#18181B";
const WHITE = "#FFFFFF";
/* A near-black host surface, to show that the mark's own white ground does
   not blend into whatever sits behind it. */
const HOST_DARK = "#0F1115";

const MARK_FILE = "/brand/motormetrics-mark.svg";

const SWATCHES = [
  { colour: MARK_INK, label: `Deep ${MARK_INK}, outer bars and wordmark` },
  { colour: MARK_ACCENT, label: `Accent ${MARK_ACCENT}, inner bars` },
  {
    colour: MARK_ACCENT_ON_DARK,
    label: `Accent on dark ${MARK_ACCENT_ON_DARK}`,
  },
  { colour: WHITE, label: `Ground white ${WHITE}` },
];

const ICONS = [
  { src: "/icons/favicon-16.png", size: 16, label: "Tab, 16px" },
  { src: "/icons/favicon-32.png", size: 32, label: "Tab, 32px" },
  { src: "/icons/favicon-48.png", size: 48, label: "Bookmark bar" },
  { src: "/icons/icon-192.png", size: 96, label: "Android, PWA" },
  { src: "/icons/icon-maskable-512.png", size: 96, label: "Android adaptive" },
  { src: "/brand/motormetrics-mark.png", size: 96, label: "Master raster" },
];

const FILES = [
  "motormetrics-mark.svg",
  "motormetrics-mark.png",
  "wordmark-primary.png",
  "wordmark-white.png",
];

function Figure({
  caption,
  children,
  className,
}: {
  caption: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={`m-0 flex flex-col gap-2 ${className ?? ""}`}>
      {children}
      <figcaption className="font-semibold text-muted text-sm">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function BrandPage() {
  return (
    <OverviewPage className="gap-8 max-md:gap-6">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Typography.Paragraph
            className="uppercase"
            color="muted"
            size="xs"
            weight="semibold"
          >
            Brand
          </Typography.Paragraph>
          <Typography.Heading level={1}>{title}</Typography.Heading>
        </div>
        <Typography.Paragraph className="max-w-prose text-pretty">
          An M drawn as five bars, the way the site draws its charts. The two
          outer bars are deep blue and the three inner bars take the accent. The
          wordmark is set in Geist Bold, in one colour, with a capital on each
          word.
        </Typography.Paragraph>
      </section>

      <section
        className="flex flex-wrap items-center justify-center gap-7 rounded-3xl p-12 shadow-overlay md:p-18"
        style={{ background: WHITE }}
      >
        <LogoMark size={96} />
        <Wordmark className="text-6xl md:text-7xl" />
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
        <Figure caption="Stacked lockup, light">
          <div
            className="flex h-50 flex-col items-center justify-center gap-3.5 rounded-2xl"
            style={{ background: WHITE }}
          >
            <LogoMark size={56} />
            <Wordmark className="text-3xl" />
          </div>
        </Figure>
        <Figure
          caption={`On deep blue: white outer bars, ${MARK_ACCENT_ON_DARK} inner`}
        >
          <div
            className="flex h-50 items-center justify-center gap-3.5 rounded-2xl"
            style={{ background: MARK_INK }}
          >
            <LogoMark inner={MARK_ACCENT_ON_DARK} outer={WHITE} size={44} />
            <Wordmark className="text-3xl" colour={WHITE} />
          </div>
        </Figure>
        <Figure caption="On the accent: all white">
          <div
            className="flex h-50 items-center justify-center gap-3.5 rounded-2xl"
            style={{ background: MARK_ACCENT }}
          >
            <LogoMark inner={WHITE} outer={WHITE} size={44} />
            <Wordmark className="text-3xl" colour={WHITE} />
          </div>
        </Figure>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
        <Figure caption="Clear space: two bar widths on every side">
          <div
            className="grid h-55 place-items-center rounded-2xl"
            style={{ background: WHITE }}
          >
            <div className="relative size-40">
              <div className="absolute inset-0 rounded-xl border-2 border-chart-4 border-dashed" />
              <LogoMark className="absolute top-8 left-8" size={96} />
            </div>
          </div>
        </Figure>
        <Figure caption="96, 48, 32 and 16px. Below 32px use the bars with no ground">
          <div
            className="flex h-55 items-end justify-center gap-7 rounded-2xl p-8"
            style={{ background: WHITE }}
          >
            <LogoMark size={96} />
            <LogoMark size={48} />
            <LogoMark size={32} />
            <LogoMark size={16} />
          </div>
        </Figure>
        <Figure caption="Colour. Type: Geist Bold.">
          <ul
            className="m-0 flex h-55 list-none flex-col justify-center gap-4 rounded-2xl p-8"
            style={{ background: WHITE }}
          >
            {SWATCHES.map(({ colour, label }) => (
              <li className="flex items-center gap-2" key={colour}>
                <span
                  className="size-7 shrink-0 rounded-md"
                  style={{
                    background: colour,
                    border: colour === WHITE ? "1px solid #D4D4D8" : undefined,
                  }}
                />
                <span
                  className="font-semibold text-sm"
                  style={{ color: INK_SURFACE }}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </Figure>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="The standard mark" />
        <Typography.Paragraph
          color="muted"
          className="max-w-3xl text-pretty leading-relaxed"
        >
          One artwork at every size: the mark on a white ground, full-bleed and
          square. <strong className="font-bold">motormetrics-mark.svg</strong>{" "}
          for anything that scales,{" "}
          <strong className="font-bold">motormetrics-mark.png</strong> at 1024
          for platforms that reject SVG. Each platform applies its own corner
          mask, so no file is pre-rounded. There is no light version and no dark
          version, because the mark brings its own ground.
        </Typography.Paragraph>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          <Figure caption="Unchanged on a light or a dark host surface">
            <div className="grid h-55 grid-cols-2 overflow-hidden rounded-2xl">
              <div
                className="grid place-items-center"
                style={{ background: "#F4F4F5" }}
              >
                <MarkFile
                  alt="The mark on a light surface"
                  className="rounded-[23%]"
                  size={96}
                />
              </div>
              <div
                className="grid place-items-center"
                style={{ background: HOST_DARK }}
              >
                <MarkFile
                  alt="The mark on a dark surface"
                  className="rounded-[23%]"
                  size={96}
                />
              </div>
            </div>
          </Figure>
          <Figure
            caption="Icon kit, each file at the size its platform asks for"
            className="col-span-full"
          >
            <div
              className="flex flex-wrap items-end gap-7 rounded-2xl p-8"
              style={{ background: WHITE }}
            >
              {ICONS.map(({ src, size, label }) => (
                <SizeSpecimen key={src} label={label}>
                  <Image
                    alt=""
                    className="rounded-[23%] border border-zinc-200"
                    height={size}
                    src={src}
                    unoptimized
                    width={size}
                  />
                </SizeSpecimen>
              ))}
            </div>
          </Figure>
        </div>
        <Typography.Paragraph
          color="muted"
          className="max-w-3xl text-pretty leading-relaxed"
        >
          The contained mark holds from 32px up. Below that, draw the
          free-standing bars in code instead. In the product itself the sidebar
          and footer draw the bars inline, where the code can pick deep blue or
          white for the surface behind them.
        </Typography.Paragraph>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Don't" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
          <Dont caption="Swap the two blues">
            <LogoMark inner={MARK_INK} outer={MARK_ACCENT} size={52} />
          </Dont>
          <Dont caption="Change the bar heights">
            <svg aria-hidden="true" height={52} viewBox="0 0 64 64" width={52}>
              {[4, 16, 28, 40, 52].map((x) => (
                <rect
                  fill={x === 4 || x === 52 ? MARK_INK : MARK_ACCENT}
                  height={44}
                  key={x}
                  rx={4}
                  width={8}
                  x={x}
                  y={10}
                />
              ))}
            </svg>
          </Dont>
          <Dont caption="Stretch or squash">
            <LogoMark
              height={52}
              preserveAspectRatio="none"
              size={52}
              width={84}
            />
          </Dont>
          <Dont caption="Set the wordmark lowercase or in two colours">
            {/* Specimen: set at the size of the wordmarks around it. */}
            <span
              className="font-extrabold text-3xl tracking-tight"
              style={{ color: MARK_INK }}
            >
              motor<span style={{ color: MARK_ACCENT }}>metrics</span>
            </span>
          </Dont>
          <Dont caption="Use status or other colours">
            <LogoMark inner="#D9822B" outer="#3C9A5F" size={52} />
          </Dont>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Wordmark and name" />
        <Card className="p-6">
          <Wordmark className="text-3xl" colour="currentColor" />
          <Typography.Paragraph color="muted">
            The wordmark and the name are written the same way: MotorMetrics,
            one word, two capitals, one colour. The wordmark is Geist Bold; in
            running copy the name takes the weight of the text around it. Icon
            slots take the mark on its own, never the wordmark.
          </Typography.Paragraph>
        </Card>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Files" />
        <Typography.Paragraph color="muted">
          {FILES.map((file, index) => (
            <span key={file}>
              {index > 0 ? " · " : null}
              <a download href={`/brand/${file}`}>
                {file}
              </a>
            </span>
          ))}
        </Typography.Paragraph>
      </section>
    </OverviewPage>
  );
}

/**
 * The standard mark, served from its file rather than drawn inline — the
 * point of these specimens is what ships, white ground and all. `unoptimized`
 * because the source is an SVG: the image optimiser rejects it, and there is
 * nothing to optimise.
 */
function MarkFile({
  alt,
  className,
  size,
}: {
  alt: string;
  className?: string;
  size: number;
}) {
  return (
    <Image
      alt={alt}
      className={className}
      height={size}
      src={MARK_FILE}
      unoptimized
      width={size}
    />
  );
}

function SizeSpecimen({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="font-semibold text-muted text-xs">{label}</span>
    </div>
  );
}

function Dont({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <Figure caption={caption} className="gap-2">
      <div
        className="grid h-32.5 place-items-center rounded-lg"
        style={{ background: WHITE }}
      >
        {children}
      </div>
    </Figure>
  );
}

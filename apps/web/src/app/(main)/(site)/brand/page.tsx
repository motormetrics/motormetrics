import { Typography } from "@heroui/react";
import {
  LogoMark,
  MARK_ACCENT,
  MARK_ACCENT_ON_DARK,
  MARK_INK,
  Wordmark,
} from "@web/components/brand-logo";
import { SitePage } from "@web/components/shared/site-page";
import { SITE_TITLE } from "@web/config";
import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";

const title = `${SITE_TITLE} logo & wordmark`;
const description =
  "How the MotorMetrics logo and wordmark are drawn, coloured and used: lockups, clear space, minimum sizes and what not to do.";

export const metadata: Metadata = {
  title: "Brand",
  description,
  alternates: { canonical: "/brand" },
};

const INK_SURFACE = "#232A2E";
const WHITE = "#FFFFFF";
/* A near-black host surface, darker than --ink-surface, to show that the
   mark's own cream ground does not blend into whatever sits behind it. */
const HOST_DARK = "#16181A";
/* Browser chrome behind the favicon specimen. Cream's next step down, so the
   tab shape reads against the white figure ground. */
const TAB_CHROME = "#EDEAE1";
/* The edge the code tile carries, so it keeps a silhouette on the page
   ground it shares. Light-mode value of --separator. */
const SEPARATOR = "#E5E1D5";

const MARK_FILE = "/brand/motormetrics-mark.svg";

const SWATCHES = [
  { colour: MARK_INK, label: `Ink deep ${MARK_INK} — first arch, "motor"` },
  {
    colour: MARK_ACCENT,
    label: `Accent ${MARK_ACCENT} — second arch, "metrics"`,
  },
  {
    colour: MARK_ACCENT_ON_DARK,
    label: `Accent on dark ${MARK_ACCENT_ON_DARK}`,
  },
  { colour: WHITE, label: "White — dark and accent grounds" },
];

const FILES = [
  "motormetrics-mark.svg",
  "motormetrics-mark.png",
  "wordmark-lockup.png",
];

/* Where each platform slot is served from. The browser and app files are
   App Router metadata conventions under src/app, so Next emits their <link>
   tags; the manifest rasters are plain public/ URLs because manifest entries
   need a path that does not carry a content hash. */
const ICON_KIT = [
  { label: "Browser", files: ["icon.svg", "favicon.ico — 16 · 32 · 48"] },
  {
    label: "App & PWA",
    files: [
      "apple-icon.png",
      "icons/icon-192.png",
      "icons/icon-512.png",
      "icons/icon-maskable-512.png",
    ],
  },
  { label: "Below 32px", files: ["<LogoMark />, drawn in code"] },
  { label: "Wiring", files: ["app/manifest.ts", "theme-color #16323F"] },
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
    <figure className={`m-0 flex flex-col gap-3 ${className ?? ""}`}>
      {children}
      <figcaption className="font-semibold text-muted text-sm">
        {caption}
      </figcaption>
    </figure>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <Typography.Heading level={2} className="text-2xl tracking-tight">
      {children}
    </Typography.Heading>
  );
}

export default function BrandPage() {
  return (
    <SitePage className="gap-14">
      <section className="flex flex-col gap-3">
        <span className="self-start rounded-full bg-accent-soft px-4 py-2 font-bold text-accent-strong text-sm">
          Brand
        </span>
        <Typography.Heading level={1} className="text-5xl tracking-tight">
          {title}
        </Typography.Heading>
        <Typography.Paragraph
          color="muted"
          className="max-w-3xl text-pretty text-lg leading-normal"
        >
          A lowercase m drawn as two arches. One arch per word; the second takes
          the accent. Wordmark set in Urbanist Extrabold, lowercase, with the
          same two-tone split.
        </Typography.Paragraph>
      </section>

      <section
        className="flex flex-wrap items-center justify-center gap-7 rounded-3xl p-12 shadow-hover md:p-18"
        style={{ background: WHITE }}
      >
        <LogoMark size={96} />
        <Wordmark className="text-6xl md:text-[76px]" />
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
        <Figure caption="Stacked lockup, light">
          <div
            className="flex h-50 flex-col items-center justify-center gap-3.5 rounded-2xl"
            style={{ background: WHITE }}
          >
            <LogoMark size={56} />
            <Wordmark className="text-[28px]" />
          </div>
        </Figure>
        <Figure
          caption={`On dark: white + accent-on-dark ${MARK_ACCENT_ON_DARK}`}
        >
          <div
            className="flex h-50 items-center justify-center gap-3.5 rounded-2xl"
            style={{ background: INK_SURFACE }}
          >
            <LogoMark first={WHITE} second={MARK_ACCENT_ON_DARK} size={44} />
            <Wordmark
              className="text-[30px]"
              first={WHITE}
              second={MARK_ACCENT_ON_DARK}
            />
          </div>
        </Figure>
        <Figure caption="On accent: mono white">
          <div
            className="flex h-50 items-center justify-center gap-3.5 rounded-2xl"
            style={{ background: MARK_ACCENT }}
          >
            <LogoMark first={WHITE} second={WHITE} size={44} />
            <Wordmark className="text-[30px]" first={WHITE} mono />
          </div>
        </Figure>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
        <Figure caption="Clear space: one arch width (x) on all sides">
          <div
            className="grid h-55 place-items-center rounded-2xl"
            style={{ background: WHITE }}
          >
            <div className="relative size-40">
              <div className="absolute inset-0 rounded-xs border-[1.5px] border-chart-4 border-dashed" />
              <LogoMark className="absolute top-8 left-8" size={96} />
              <span className="absolute top-1.5 right-0 left-0 text-center font-bold text-[11px] text-chart-4">
                x
              </span>
            </div>
          </div>
        </Figure>
        <Figure caption="Stroke legibility. The free-standing arches hold down to 24px — use them for the 24–31px range, below the contained file's 32px floor">
          <div
            className="flex h-55 items-end justify-center gap-7 rounded-2xl p-7"
            style={{ background: WHITE }}
          >
            <SizeSpecimen label="24 min">
              <LogoMark size={24} />
            </SizeSpecimen>
            <SizeSpecimen label="32">
              <LogoMark size={32} />
            </SizeSpecimen>
            <SizeSpecimen label="64">
              <LogoMark size={64} />
            </SizeSpecimen>
          </div>
        </Figure>
        <Figure caption="Colour. Type: Urbanist 800, tracking -0.03em.">
          <ul
            className="m-0 flex h-55 list-none flex-col justify-center gap-3 rounded-2xl p-7"
            style={{ background: WHITE }}
          >
            {SWATCHES.map(({ colour, label }) => (
              <li className="flex items-center gap-3" key={colour}>
                <span
                  className="size-7 shrink-0 rounded-full"
                  style={{
                    background: colour,
                    border: colour === WHITE ? "1px solid #E5E1D5" : undefined,
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

      <section className="flex flex-col gap-4">
        <SectionHeading>The standard mark</SectionHeading>
        <Typography.Paragraph
          color="muted"
          className="max-w-3xl text-pretty leading-relaxed"
        >
          One design, in two formats because no single file is accepted
          everywhere:{" "}
          <strong className="font-bold">motormetrics-mark.svg</strong> for
          anything that scales,{" "}
          <strong className="font-bold">motormetrics-mark.png</strong> at 1024
          for platforms that reject SVG. Same artwork in both. Favicon at 32px
          and up, PWA icon, app tile, social avatar, partner listing, deck title
          slide — all of them take this file. There is no light version and no
          dark version, because the mark brings its own cream ground and
          therefore does not care what is behind it.
        </Typography.Paragraph>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          <Figure caption="Unchanged on a light or a dark host surface">
            <div className="grid h-55 grid-cols-2 overflow-hidden rounded-2xl">
              <div
                className="grid place-items-center"
                style={{ background: WHITE }}
              >
                <MarkFile
                  alt="The mark on a light surface"
                  className="rounded-[22px]"
                  size={96}
                />
              </div>
              <div
                className="grid place-items-center"
                style={{ background: HOST_DARK }}
              >
                <MarkFile
                  alt="The mark on a dark surface"
                  className="rounded-[22px]"
                  size={96}
                />
              </div>
            </div>
          </Figure>
          <Figure caption="Squircle, 22px radius at 96px — the house shape. The file itself is a full-bleed square; platforms round it themselves">
            <div
              className="flex h-55 items-center justify-center rounded-2xl"
              style={{ background: WHITE }}
            >
              <MarkFile
                alt="The mark in its squircle frame"
                className="rounded-[28px]"
                size={120}
              />
            </div>
          </Figure>
          <Figure caption="Holds from 32px up. One file at every size above that">
            <div
              className="flex h-55 items-end justify-center gap-5 rounded-2xl p-7"
              style={{ background: WHITE }}
            >
              <SizeSpecimen label="32">
                <MarkFile
                  alt="The mark at 32px"
                  className="rounded-[23%]"
                  size={32}
                />
              </SizeSpecimen>
              <SizeSpecimen label="64">
                <MarkFile
                  alt="The mark at 64px"
                  className="rounded-[23%]"
                  size={64}
                />
              </SizeSpecimen>
              <SizeSpecimen label="96">
                <MarkFile
                  alt="The mark at 96px"
                  className="rounded-[23%]"
                  size={96}
                />
              </SizeSpecimen>
            </div>
          </Figure>
        </div>
        <Typography.Paragraph
          color="muted"
          className="max-w-3xl text-pretty text-[15px] leading-relaxed"
        >
          The cost of standardising is two things. The mark always appears in
          its cream frame, so on a dark surface it reads as a tile rather than
          as arches floating free. And the 50% inset that keeps every crop safe
          leaves too little stroke at favicon scale — at a 16px frame the arches
          are 8px wide on a 1.2px stroke, which is a smudge. Below 32px, set the
          free-standing arches in code instead. The product follows the same
          shape: the nav, the footer and the share cards draw the tile in code
          rather than loading the file, so the arches can take ink or white as
          the theme requires. Because those surfaces are cream themselves, the
          code tile carries a 1px {SEPARATOR} edge to hold its silhouette; the
          file needs no edge, since it only ever lands on a host surface that is
          not cream. Radius stays at 23% of the frame — 12px at 52px, 7px at
          30px.
        </Typography.Paragraph>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Icon kit</SectionHeading>
        <Typography.Paragraph
          color="muted"
          className="max-w-3xl text-pretty leading-relaxed"
        >
          The platform files, cut from the standard mark. Every raster is a
          full-bleed square on the cream ground — never pre-round the corners,
          because iOS, Android and the browser each apply their own mask, and a
          baked-in radius shows up as a notch inside theirs.
        </Typography.Paragraph>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          <Figure caption="Favicon. The SVG leads; favicon.ico carries the 16, 32 and 48 behind it. The 16 is redrawn on a tighter inset so the strokes survive">
            <div
              className="flex h-55 items-center justify-center rounded-2xl p-7"
              style={{ background: WHITE }}
            >
              <div
                className="flex items-center gap-2.5 rounded-t-xl px-4 pt-2.5 pb-3"
                style={{ background: TAB_CHROME }}
              >
                <Image
                  alt="The favicon at 16px"
                  height={16}
                  src="/favicon.ico"
                  unoptimized
                  width={16}
                />
                <span className="font-semibold text-[13px] text-muted">
                  COE results — MotorMetrics
                </span>
              </div>
            </div>
          </Figure>
          <Figure caption="Home screen. iOS takes apple-icon.png at 180. Android crops to a circle, so the maskable file pulls the arches in to 50% of the frame">
            <div
              className="flex h-55 items-center justify-center gap-7 rounded-2xl"
              style={{ background: WHITE }}
            >
              <SizeSpecimen label="Standard">
                <Image
                  alt="The standard inset, as iOS receives it"
                  className="rounded-[24%]"
                  height={84}
                  src="/icons/icon-512.png"
                  width={84}
                />
              </SizeSpecimen>
              <SizeSpecimen label="Maskable">
                <Image
                  alt="The maskable inset, cropped to a circle by Android"
                  className="rounded-full"
                  height={84}
                  src="/icons/icon-maskable-512.png"
                  width={84}
                />
              </SizeSpecimen>
            </div>
          </Figure>
          <Figure caption="Below the 32px floor the file gives way to the free-standing arches, drawn in code so they can take ink or white">
            <div
              className="flex h-55 items-end justify-center gap-7 rounded-2xl p-7"
              style={{ background: WHITE }}
            >
              <SizeSpecimen label="24">
                <LogoMark size={24} />
              </SizeSpecimen>
              <SizeSpecimen label="16">
                <LogoMark size={16} />
              </SizeSpecimen>
            </div>
          </Figure>
        </div>
        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-10 gap-y-5 rounded-2xl bg-surface p-7">
          {ICON_KIT.map(({ files, label }) => (
            <div className="flex flex-col gap-1.5" key={label}>
              <dt className="font-bold text-subtle text-xs uppercase tracking-[0.08em]">
                {label}
              </dt>
              <dd className="m-0 flex flex-col text-[14.5px] leading-7">
                {files.map((file) => (
                  <span key={file}>{file}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Don&apos;t</SectionHeading>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
          <Dont caption="Swap the colour order">
            <LogoMark first={MARK_ACCENT} second={MARK_INK} size={52} />
          </Dont>
          <Dont caption="Change the stroke weight">
            <LogoMark size={52} strokeWidth={3} />
          </Dont>
          <Dont caption="Stretch or squash">
            <LogoMark
              height={52}
              preserveAspectRatio="none"
              size={52}
              width={80}
            />
          </Dont>
          <Dont caption="Capitalise the wordmark">
            <span
              className="font-extrabold text-[26px] tracking-[-0.03em]"
              style={{ color: MARK_INK }}
            >
              Motor<span style={{ color: MARK_ACCENT }}>Metrics</span>
            </span>
          </Dont>
          <Dont caption="Use status or other colours">
            <LogoMark first="#3C9A5F" second="#D9822B" size={52} />
          </Dont>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Wordmark vs. name</SectionHeading>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          <div className="flex flex-col gap-3 rounded-2xl bg-surface p-7">
            <Wordmark className="text-[30px]" />
            <Typography.Paragraph color="muted" className="text-[15px]">
              The wordmark is a graphic. Always lowercase, always Urbanist 800
              with the two-tone split. Use it wherever type can actually be set:
              the nav, the footer mark, share cards, docs and decks. Icon slots
              take the mark on its own — never the wordmark.
            </Typography.Paragraph>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-surface p-7">
            <span className="font-bold text-[30px] text-accent-deep leading-none tracking-tight dark:text-foreground">
              MotorMetrics
            </span>
            <Typography.Paragraph color="muted" className="text-[15px]">
              The name is a proper noun. In running copy, page titles, meta
              descriptions and legal text, write MotorMetrics with two capitals:
              &ldquo;&copy; 2026 MotorMetrics&rdquo;, &ldquo;About
              MotorMetrics&rdquo;, &ldquo;MotorMetrics tracks COE results
              daily.&rdquo;
            </Typography.Paragraph>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionHeading>Files</SectionHeading>
        <Typography.Paragraph color="muted" className="text-[15px] leading-7">
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
    </SitePage>
  );
}

/**
 * The standard mark, served from its file rather than drawn inline — the
 * point of these specimens is what ships, cream ground and all. `unoptimized`
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
    <div className="flex flex-col items-center gap-2.5">
      {children}
      <span className="font-semibold text-subtle text-xs">{label}</span>
    </div>
  );
}

function Dont({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <Figure caption={caption} className="gap-2.5">
      <div
        className="grid h-32.5 place-items-center rounded-lg"
        style={{ background: WHITE }}
      >
        {children}
      </div>
    </Figure>
  );
}

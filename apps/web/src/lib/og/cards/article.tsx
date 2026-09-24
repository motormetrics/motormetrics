import { OG_COLOURS } from "@web/lib/og/colours";
import { Frame } from "@web/lib/og/templates/frame";
import { Pill } from "@web/lib/og/templates/pill";

export interface ArticleProps {
  height: number;
  /** Category tag, e.g. "COE" or "Learn" */
  tag: string;
  /** Date and reading time line, e.g. "29 Oct 2025 · 5 min read" */
  byline: string;
  title: string;
  excerpt?: string;
}

/** 07 · Blog post or guide: title, tag and date from the content */
export function Article({ height, tag, byline, title, excerpt }: ArticleProps) {
  const titleSize = title.length > 48 ? 56 : 70;

  return (
    <Frame height={height}>
      <div
        style={{
          position: "absolute",
          top: -140,
          right: -120,
          width: 460,
          height: 460,
          borderRadius: "50%",
          backgroundColor: OG_COLOURS.accentWash,
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 26,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Pill tone="solid">{tag}</Pill>
          <span
            style={{ fontSize: 24, fontWeight: 600, color: OG_COLOURS.subtle }}
          >
            {byline}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: OG_COLOURS.ink,
            maxWidth: 940,
            lineClamp: 3,
          }}
        >
          {title}
        </div>
        {excerpt && (
          <div
            style={{
              display: "flex",
              fontSize: 29,
              lineHeight: 1.4,
              fontWeight: 500,
              color: OG_COLOURS.muted,
              maxWidth: 880,
              lineClamp: 3,
            }}
          >
            {excerpt}
          </div>
        )}
      </div>
    </Frame>
  );
}

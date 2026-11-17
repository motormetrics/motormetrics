"use client";

import { useEffect, useState } from "react";

const MINUTE = 60_000;

/** "2:15 pm, 17 Nov", the snapshot time in Singapore. */
const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-SG", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone: "Asia/Singapore",
  });

/** "just now", "12 min ago", "3 h ago". */
const formatAge = (iso: string, now: number) => {
  const minutes = Math.max(
    0,
    Math.floor((now - new Date(iso).getTime()) / MINUTE),
  );
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours} h ago` : `on ${formatTime(iso)}`;
};

/**
 * How old the hourly snapshot is: "Updated 12 min ago". The prerendered
 * shell cannot know the time it is read, so it carries the snapshot's clock
 * time and the age replaces it once the page is in the browser, then ticks
 * every minute.
 */
export function UpdatedAgo({ observedAt }: { observedAt: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), MINUTE);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <time dateTime={observedAt} title={`${formatTime(observedAt)} SGT`}>
      Updated{" "}
      {now === null
        ? `${formatTime(observedAt)} SGT`
        : formatAge(observedAt, now)}
    </time>
  );
}

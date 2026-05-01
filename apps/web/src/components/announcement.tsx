"use client";

import { Alert } from "@heroui/react";

import { announcements } from "@web/config";
import { usePathname } from "next/navigation";

export function Announcement() {
  const pathname = usePathname();

  if (announcements.length === 0) {
    return null;
  }

  // Find the first announcement that matches the current path
  // Prioritize specific path matches over global announcements
  const matchingAnnouncement = announcements.find((announcement) => {
    if (!announcement.paths) {
      return false; // Skip global announcements in first pass
    }
    return announcement.paths.some((path) => pathname.startsWith(path));
  });

  // If no specific path match, fall back to global announcements
  const activeAnnouncement =
    matchingAnnouncement ||
    announcements.find((announcement) => !announcement.paths);

  if (!activeAnnouncement) {
    return null;
  }

  return (
    <Alert
      className="rounded-none bg-accent text-accent-foreground"
      status="accent"
    >
      <Alert.Content>
        <Alert.Title className="text-accent-foreground">
          {activeAnnouncement.content}
        </Alert.Title>
      </Alert.Content>
    </Alert>
  );
}

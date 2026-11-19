"use client";

import { Alert } from "@heroui/react";
import { announcements } from "@web/config";
import { Megaphone } from "lucide-react";
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

  // A banner at the top of the content area, under the breadcrumbs: seen on
  // every page without pushing the sidebar down. It cannot be dismissed.
  return (
    <Alert className="border border-separator" status="accent">
      <Alert.Indicator>
        <Megaphone className="size-4" />
      </Alert.Indicator>
      <Alert.Content>
        <Alert.Title>{activeAnnouncement.title}</Alert.Title>
        <Alert.Description>{activeAnnouncement.description}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}

"use client";

import { cn } from "@heroui/react";

import { incrementPostView } from "@web/app/(main)/(site)/blog/actions/views";
import { useEffect, useEffectEvent, useState } from "react";

interface ViewCounterProps {
  postId: string;
  initialCount?: number;
  className?: string;
}

export function ViewCounter({
  postId,
  initialCount = 0,
  className,
}: ViewCounterProps) {
  const [views, setViews] = useState(initialCount);

  const increasePostView = useEffectEvent(() => {
    incrementPostView(postId).then(setViews);
  });

  useEffect(() => {
    increasePostView();
  }, []);

  return (
    <span className={cn("text-muted", className)}>
      {views.toLocaleString()} {views === 1 ? "view" : "views"}
    </span>
  );
}

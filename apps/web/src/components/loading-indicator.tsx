"use client";

import { ProgressBar } from "@heroui/react";

import { useLinkStatus } from "next/link";
import { useEffect, useState } from "react";

const LoadingIndicator = () => {
  const { pending } = useLinkStatus();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (pending) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timeout);
    }
  }, [pending]);

  if (!pending && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 z-50 w-full">
      <ProgressBar
        value={progress}
        className="h-1 w-full rounded-none"
        color="accent"
        aria-label="Navigation loading"
      />
    </div>
  );
};

export default LoadingIndicator;

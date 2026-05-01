"use client";

import { Button } from "@heroui/react";

import { fadeInUpVariants } from "@web/config/animations";
import { motion } from "framer-motion";
import { Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface AnimatedEmptyStateWrapperProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedEmptyStateWrapper({
  children,
  className,
}: AnimatedEmptyStateWrapperProps) {
  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center justify-center gap-6 rounded-3xl bg-default/50 px-8 py-12 ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

export function DefaultActions() {
  return (
    <div className="flex items-center gap-4">
      <Link href="/" className="no-underline">
        <Button className="rounded-full" variant="outline">
          <Home className="size-4" />
          Go Home
        </Button>
      </Link>
      <Button
        className="rounded-full"
        variant="outline"
        onPress={() => history.back()}
      >
        <RotateCcw className="size-4" />
        Go Back
      </Button>
    </div>
  );
}

"use client";

import { Text } from "@heroui/react";
import { fadeInUpVariants } from "@web/config/animations";
import { motion } from "framer-motion";

interface BlogPageHeaderProps {
  title: string;
  description: string;
}

export function BlogPageHeader({ title, description }: BlogPageHeaderProps) {
  return (
    <motion.div
      className="flex flex-col gap-2"
      variants={fadeInUpVariants}
      initial="hidden"
      animate="visible"
    >
      <Text type="h1">{title}</Text>
      <Text type="body">{description}</Text>
    </motion.div>
  );
}

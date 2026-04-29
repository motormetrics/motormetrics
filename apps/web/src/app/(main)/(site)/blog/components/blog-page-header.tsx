"use client";

import Typography from "@web/components/typography";
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
      <Typography.H1>{title}</Typography.H1>
      <Typography.TextLg className="text-default-600">
        {description}
      </Typography.TextLg>
    </motion.div>
  );
}

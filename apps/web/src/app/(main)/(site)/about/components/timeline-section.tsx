"use client";

import { Avatar } from "@heroui/avatar";
import { cn } from "@heroui/theme";
import Typography from "@web/components/typography";
import { fadeInUpVariants } from "@web/config/animations";
import { motion } from "framer-motion";

interface TimelineItem {
  date: string;
  title: string;
  description: string;
  highlight?: boolean;
}

const timelineData: TimelineItem[] = [
  {
    date: "2023",
    title: "Project Inception",
    description:
      "Started as a personal project to track car registration trends and COE prices.",
  },
  {
    date: "2024",
    title: "Going Live",
    description:
      "Launched the platform and made car market data free for everyone.",
  },
  {
    date: "2025",
    title: "AI & Social Media",
    description:
      "Added AI-written blog posts, social media updates, and car deregistration data.",
    highlight: true,
  },
];

interface TimelineItemComponentProps {
  item: TimelineItem;
  index: number;
}

const TimelineItemComponent = ({ item, index }: TimelineItemComponentProps) => {
  return (
    <motion.div
      className="group relative flex gap-6 lg:gap-8"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {/* Timeline line and dot */}
      <div className="relative flex flex-col items-center">
        <Avatar
          name={item.date}
          classNames={{
            base: cn(
              "relative z-10 h-12 w-12 border-2 bg-card transition-colors",
              item.highlight
                ? "border-primary text-primary"
                : "border-default-300 text-default-600 group-hover:border-primary/50",
            ),
            name: "font-medium text-sm",
          }}
          showFallback
          getInitials={() => item.date}
        />
        {index < timelineData.length - 1 && (
          <div className="absolute top-12 h-full w-0.5 bg-gradient-to-b from-default-300 to-default-200" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 pb-12">
        <Typography.H3
          className={cn(
            "text-lg",
            item.highlight ? "text-primary" : "text-foreground",
          )}
        >
          {item.title}
        </Typography.H3>
        <Typography.Text className="max-w-md text-default-600">
          {item.description}
        </Typography.Text>
      </div>
    </motion.div>
  );
};

export function TimelineSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Header */}
        <div className="lg:col-span-4">
          <motion.div
            className="sticky top-24 flex flex-col gap-4"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Typography.Label className="text-primary uppercase tracking-widest">
              Our Journey
            </Typography.Label>
            <Typography.H2 className="lg:text-4xl">
              How this project started
            </Typography.H2>
            <Typography.Text className="text-default-600">
              What started as a personal tool to track COE prices is now a free
              resource for anyone interested in Singapore&apos;s car market.
            </Typography.Text>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-8">
          <div className="flex flex-col">
            {timelineData.map((item, index) => (
              <TimelineItemComponent
                key={item.date}
                item={item}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

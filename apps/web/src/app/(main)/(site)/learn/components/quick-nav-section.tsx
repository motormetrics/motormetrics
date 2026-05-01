"use client";

import { Card, Link } from "@heroui/react";

import Typography from "@web/components/typography";
import {
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { motion } from "framer-motion";
import { BookOpen, Database, GraduationCap, HelpCircle } from "lucide-react";

const navItems = [
  {
    title: "FAQ",
    description: "Common questions about COE, PARF, and car registration",
    href: "#faq",
    icon: HelpCircle,
    iconColor: "text-accent",
    containerBg: "bg-accent/10",
    hoverBorder: "hover:border-accent/30",
  },
  {
    title: "Glossary",
    description: "Key terms and abbreviations explained",
    href: "#glossary",
    icon: BookOpen,
    iconColor: "text-success",
    containerBg: "bg-success/10",
    hoverBorder: "hover:border-success/30",
  },
  {
    title: "Data Sources",
    description: "Where our data comes from and how it's updated",
    href: "#data-sources",
    icon: Database,
    iconColor: "text-muted",
    containerBg: "bg-muted/10",
    hoverBorder: "hover:border-muted/30",
  },
  {
    title: "Guides",
    description: "Step-by-step guides to understanding the market",
    href: "#guides",
    icon: GraduationCap,
    iconColor: "text-warning",
    containerBg: "bg-warning/10",
    hoverBorder: "hover:border-warning/30",
  },
];

export function QuickNavSection() {
  return (
    <section className="pb-20">
      <div className="container mx-auto">
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {navItems.map((item) => (
            <motion.div
              key={item.title}
              variants={staggerItemVariants}
              className="group"
            >
              <Link
                href={item.href}
                className="block h-full text-foreground no-underline"
              >
                <Card
                  className={`h-full border-border/80 transition-all duration-500 ${item.hoverBorder} hover:shadow-accent/5 hover:shadow-lg`}
                >
                  <Card.Content className="flex flex-col gap-4">
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl ${item.containerBg} transition-colors`}
                    >
                      <item.icon className={`size-6 ${item.iconColor}`} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Typography.H4>{item.title}</Typography.H4>
                      <Typography.TextSm>{item.description}</Typography.TextSm>
                    </div>
                  </Card.Content>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

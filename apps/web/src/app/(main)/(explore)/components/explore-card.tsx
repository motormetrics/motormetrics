import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { cn } from "@heroui/theme";
import { BetaChip, NewChip } from "@web/components/shared/chips";
import Typography from "@web/components/typography";
import type { ReactNode } from "react";

interface ExploreCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  badge?: "new" | "beta";
  variant?: "hero" | "standard" | "tool";
  className?: string;
}

export function ExploreCard({
  title,
  description,
  href,
  icon,
  badge,
  variant = "standard",
  className,
}: ExploreCardProps) {
  const isHero = variant === "hero";
  const isTool = variant === "tool";

  return (
    <Link href={href} className={cn("group block h-full", className)}>
      <Card
        className={cn(
          "h-full transition-all duration-300",
          "hover:scale-[1.02] hover:shadow-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isHero && [
            "bg-gradient-to-br from-primary/5 via-primary/8 to-primary/12",
            "border border-primary/10",
          ],
          isTool && "border border-default-200 bg-default-100/50",
          !isHero && !isTool && "bg-content1",
        )}
      >
        <CardHeader
          className={cn(
            "flex flex-col items-start gap-3",
            isHero ? "p-6" : "p-4",
          )}
        >
          <div className="flex w-full items-center justify-between">
            <div
              className={cn(
                "flex items-center justify-center rounded-xl",
                isHero ? "size-12 bg-primary/10" : "size-10 bg-default-100",
              )}
            >
              {icon}
            </div>
            {badge === "new" && <NewChip />}
            {badge === "beta" && <BetaChip />}
          </div>
          {isHero ? (
            <Typography.H3 className="transition-colors group-hover:text-primary">
              {title}
            </Typography.H3>
          ) : (
            <Typography.H4 className="transition-colors group-hover:text-primary">
              {title}
            </Typography.H4>
          )}
        </CardHeader>
        <CardBody className={cn("pt-0", isHero ? "px-6 pb-6" : "px-4 pb-4")}>
          <Typography.TextSm className={isHero ? "text-default-600" : ""}>
            {description}
          </Typography.TextSm>
        </CardBody>
      </Card>
    </Link>
  );
}

import { Link } from "@heroui/react";
import type { SelectPost } from "@motormetrics/database";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PostNavigationProps {
  previous?: SelectPost;
  next?: SelectPost;
}

export function PostNavigation({ previous, next }: PostNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Post navigation"
      className="border-foreground/10 border-t pt-12"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Previous Post */}
        <div className="group">
          {previous ? (
            <Link
              href={`/blog/${previous.slug}`}
              className="flex h-full flex-col"
            >
              {/* Direction Label */}
              <div className="mb-3 flex items-center gap-2">
                <ArrowLeft className="size-4 -translate-x-0 text-foreground/40 transition-transform duration-300 ease-out group-hover:-translate-x-1 group-hover:text-primary" />
                <span className="font-medium text-[10px] text-foreground/40 uppercase tracking-[0.25em] transition-colors duration-300 group-hover:text-primary">
                  Previous
                </span>
              </div>

              {/* Title */}
              <h3 className="line-clamp-2 font-semibold text-foreground text-lg leading-snug transition-colors duration-300 group-hover:text-primary md:text-xl">
                {previous.title}
              </h3>

              {/* Animated underline */}
              <div className="mt-4 h-px w-0 bg-primary transition-all duration-500 ease-out group-hover:w-16" />
            </Link>
          ) : (
            <div className="hidden md:block" />
          )}
        </div>

        {/* Next Post */}
        <div className="group md:text-right">
          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              className="flex h-full flex-col md:items-end"
            >
              {/* Direction Label */}
              <div className="mb-3 flex items-center gap-2">
                <span className="font-medium text-[10px] text-foreground/40 uppercase tracking-[0.25em] transition-colors duration-300 group-hover:text-primary">
                  Next
                </span>
                <ArrowRight className="size-4 translate-x-0 text-foreground/40 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:text-primary" />
              </div>

              {/* Title */}
              <h3 className="line-clamp-2 font-semibold text-foreground text-lg leading-snug transition-colors duration-300 group-hover:text-primary md:text-xl">
                {next.title}
              </h3>

              {/* Animated underline */}
              <div className="mt-4 h-px w-0 bg-primary transition-all duration-500 ease-out group-hover:w-16 md:ml-auto" />
            </Link>
          ) : (
            <div className="hidden md:block" />
          )}
        </div>
      </div>
    </nav>
  );
}

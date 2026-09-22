import type { SelectPost } from "@motormetrics/database/schema";
import { FollowLinks } from "./follow-links";
import { TableOfContents } from "./table-of-contents";

/**
 * The comp's right-hand rail: contents, then the pages carrying the live
 * figures. The comp's middle card defines the terms the post uses; posts
 * record no terms, so the rail is two blocks rather than three.
 */
export function PostSidebar({ post }: { post: SelectPost }) {
  return (
    <aside className="flex flex-col gap-6 lg:sticky lg:top-9">
      <TableOfContents />
      <FollowLinks post={post} />
    </aside>
  );
}

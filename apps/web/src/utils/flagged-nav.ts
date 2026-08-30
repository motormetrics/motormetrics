import {
  ADVERTISE_FOOTER_ITEM,
  ADVERTISE_MORE_ITEM,
  BLOG_MORE_ITEM,
  FOOTER_NAV_ITEMS,
  MORE_NAV_ITEMS,
  type NavItem,
  type NavigationItem,
} from "@web/config/navigation";

export function moreNavItems({
  advertise,
  blog,
}: {
  advertise: boolean;
  blog: boolean;
}): NavigationItem[] {
  return [
    ...MORE_NAV_ITEMS,
    ...(advertise ? [ADVERTISE_MORE_ITEM] : []),
    ...(blog ? [BLOG_MORE_ITEM] : []),
  ];
}

export function footerNavItems({
  advertise,
}: {
  advertise: boolean;
}): NavItem[] {
  if (!advertise) {
    return [...FOOTER_NAV_ITEMS];
  }

  const learnIndex = FOOTER_NAV_ITEMS.findIndex(
    (item) => item.href === "/learn",
  );

  return [
    ...FOOTER_NAV_ITEMS.slice(0, learnIndex + 1),
    ADVERTISE_FOOTER_ITEM,
    ...FOOTER_NAV_ITEMS.slice(learnIndex + 1),
  ];
}

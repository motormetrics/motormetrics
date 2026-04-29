"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/navbar";
import { cn } from "@heroui/theme";
import { BrandLogo } from "@web/components/brand-logo";
import { NAV_ITEMS, type NavItem } from "@web/config/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: NavItem["href"]) => {
    if (path === "/") {
      // Dashboard active for home, cars, coe routes (all dashboard content)
      return (
        !pathname.startsWith("/blog") &&
        !pathname.startsWith("/learn") &&
        !pathname.startsWith("/about")
      );
    }
    return pathname.startsWith(path);
  };

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="2xl"
      isBordered={false}
      position="sticky"
    >
      {/* Brand and Mobile Toggle */}
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden"
        />
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Navigation */}
      <NavbarContent className="hidden gap-1 md:flex" justify="center">
        {NAV_ITEMS.map(({ href, label }) => {
          const active = isActive(href);

          return (
            <NavbarItem key={href}>
              <Link
                href={href}
                className={cn(
                  "rounded-full px-4 py-2 font-medium text-sm transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-default-100 text-foreground hover:bg-default-200",
                )}
              >
                {label}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="bg-background/95 pt-6 backdrop-blur-xl">
        {NAV_ITEMS.map(({ href, label }) => {
          const active = isActive(href);

          return (
            <NavbarMenuItem key={href}>
              <Link
                href={href}
                className={cn(
                  "block w-full py-3 text-lg transition-colors",
                  active
                    ? "font-semibold text-primary"
                    : "text-foreground/70 hover:text-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            </NavbarMenuItem>
          );
        })}
      </NavbarMenu>
    </Navbar>
  );
}

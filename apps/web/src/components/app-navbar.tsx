"use client";

import { Navbar } from "@heroui-pro/react/navbar";
import { BrandLogo } from "@web/components/brand-logo";
import { NAV_ITEMS, type NavItem } from "@web/config/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: NavItem["href"]) => {
    if (path === "/") {
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
      aria-label="Main navigation"
      className="border-separator border-b bg-background/90 backdrop-blur-xl"
      isMenuOpen={isMenuOpen}
      maxWidth="2xl"
      navigate={router.push}
      onMenuOpenChange={setIsMenuOpen}
      position="sticky"
    >
      <Navbar.Header>
        <Navbar.MenuToggle className="md:hidden" />

        <Navbar.Brand>
          <BrandLogo />
          <span className="sr-only">MotorMetrics</span>
        </Navbar.Brand>

        <Navbar.Spacer />

        <Navbar.Content className="hidden md:flex">
          {NAV_ITEMS.map(({ href, label }) => (
            <Navbar.Item key={href} href={href} isCurrent={isActive(href)}>
              {label}
            </Navbar.Item>
          ))}
        </Navbar.Content>
      </Navbar.Header>

      <Navbar.Menu className="md:hidden">
        {NAV_ITEMS.map(({ href, label }) => (
          <Navbar.MenuItem
            key={href}
            href={href}
            isCurrent={isActive(href)}
            onClick={() => setIsMenuOpen(false)}
          >
            {label}
          </Navbar.MenuItem>
        ))}
      </Navbar.Menu>
    </Navbar>
  );
}

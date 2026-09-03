import { render, screen } from "@testing-library/react";
import { Announcement } from "@web/components/announcement";
import type { Announcement as AnnouncementType } from "@web/types";
import { createElement } from "react";
import { vi } from "vitest";

// Hoisted so the mock factories below can reach it once they are lifted
// above the imports (the browser mocker evaluates them eagerly).
const state = vi.hoisted(() => ({
  announcements: [] as AnnouncementType[],
  pathname: "/",
}));

vi.mock("@web/config", () => ({
  get announcements() {
    return state.announcements;
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
}));

describe("Announcement", () => {
  beforeEach(() => {
    state.announcements.length = 0;
    state.pathname = "/";
  });

  it("should prioritise path-specific announcements", () => {
    state.announcements.push(
      { content: "Cars update", paths: ["/cars"] },
      { content: "Global update" },
    );
    state.pathname = "/cars/makes";

    const { container } = render(createElement(Announcement));

    expect(container.firstChild).toMatchSnapshot();
    expect(screen.getByText("Cars update")).toBeInTheDocument();
  });

  it("should fall back to global announcements", () => {
    state.announcements.push({ content: "Global notice" });
    state.pathname = "/unknown";

    render(createElement(Announcement));

    expect(screen.getByText("Global notice")).toBeInTheDocument();
  });

  it("should render nothing when configured list is empty", () => {
    const { container } = render(createElement(Announcement));
    expect(container).toBeEmptyDOMElement();
  });

  it("should render nothing when no path matches and no global fallback exists", () => {
    state.announcements.push({ content: "Cars update", paths: ["/cars"] });
    state.pathname = "/coe";

    const { container } = render(createElement(Announcement));

    expect(container).toBeEmptyDOMElement();
  });
});

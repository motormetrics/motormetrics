import { render, screen } from "@testing-library/react";
import { Announcement } from "@web/components/announcement";
import type { Announcement as AnnouncementType } from "@web/types";
import { createElement } from "react";
import { vi } from "vitest";

const announcementsFixture: AnnouncementType[] = [];
let mockPathname = "/";

vi.mock("@web/config", () => ({
  get announcements() {
    return announcementsFixture;
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("Announcement", () => {
  beforeEach(() => {
    announcementsFixture.length = 0;
    mockPathname = "/";
  });

  it("should prioritise path-specific announcements", () => {
    announcementsFixture.push(
      { content: "Cars update", paths: ["/cars"] },
      { content: "Global update" },
    );
    mockPathname = "/cars/makes";

    const { container } = render(createElement(Announcement));

    expect(container.firstChild).toMatchSnapshot();
    expect(screen.getByText("Cars update")).toBeInTheDocument();
  });

  it("should fall back to global announcements", () => {
    announcementsFixture.push({ content: "Global notice" });
    mockPathname = "/unknown";

    render(createElement(Announcement));

    expect(screen.getByText("Global notice")).toBeInTheDocument();
  });

  it("should render nothing when configured list is empty", () => {
    const { container } = render(createElement(Announcement));
    expect(container).toBeEmptyDOMElement();
  });

  it("should render nothing when no path matches and no global fallback exists", () => {
    announcementsFixture.push({ content: "Cars update", paths: ["/cars"] });
    mockPathname = "/coe";

    const { container } = render(createElement(Announcement));

    expect(container).toBeEmptyDOMElement();
  });
});

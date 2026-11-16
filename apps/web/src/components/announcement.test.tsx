import { Announcement } from "@web/components/announcement";
import type { Announcement as AnnouncementType } from "@web/types";
import { createElement } from "react";
import { vi } from "vitest";
import { render } from "vitest-browser-react";

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

  it("should prioritise path-specific announcements", async () => {
    state.announcements.push(
      { title: "Cars", description: "Cars update", paths: ["/cars"] },
      { title: "Global", description: "Global update" },
    );
    state.pathname = "/cars/makes";

    const screen = await render(createElement(Announcement));

    expect(screen.container.firstChild).toMatchSnapshot();
    await expect.element(screen.getByText("Cars update")).toBeInTheDocument();
  });

  it("should fall back to global announcements", async () => {
    state.announcements.push({ title: "Global", description: "Global notice" });
    state.pathname = "/unknown";

    const screen = await render(createElement(Announcement));

    await expect.element(screen.getByText("Global notice")).toBeInTheDocument();
  });

  it("should render a title without a description", async () => {
    state.announcements.push({ title: "Title only" });

    const screen = await render(createElement(Announcement));

    await expect.element(screen.getByText("Title only")).toBeInTheDocument();
    expect(
      screen.container.querySelector(".alert__description"),
    ).toBeEmptyDOMElement();
  });

  it("should render nothing when configured list is empty", async () => {
    const screen = await render(createElement(Announcement));
    expect(screen.container).toBeEmptyDOMElement();
  });

  it("should render nothing when no path matches and no global fallback exists", async () => {
    state.announcements.push({
      title: "Cars",
      description: "Cars update",
      paths: ["/cars"],
    });
    state.pathname = "/coe";

    const screen = await render(createElement(Announcement));

    expect(screen.container).toBeEmptyDOMElement();
  });
});

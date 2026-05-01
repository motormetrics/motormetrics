import { render, screen } from "@testing-library/react";
import { Announcement } from "@web/components/announcement";
import type { Announcement as AnnouncementType } from "@web/types";
import { vi } from "vitest";

const announcementsFixture: AnnouncementType[] = [];
let mockPathname = "/";

vi.mock("@heroui/react", () => {
  const Alert = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert">{children}</div>
  );

  Alert.Content = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  Alert.Title = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-title">{children}</div>
  );

  return { Alert };
});

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

    render(<Announcement />);

    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByTestId("alert-title")).toHaveTextContent(/Cars update/);
  });

  it("should fall back to global announcements", () => {
    announcementsFixture.push({ content: "Global notice" });
    mockPathname = "/unknown";

    render(<Announcement />);

    expect(screen.getByTestId("alert-title")).toHaveTextContent(
      "Global notice",
    );
  });

  it("should render nothing when configured list is empty", () => {
    const { container } = render(<Announcement />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should render nothing when no path matches and no global fallback exists", () => {
    announcementsFixture.push({ content: "Cars update", paths: ["/cars"] });
    mockPathname = "/coe";

    const { container } = render(<Announcement />);

    expect(container).toBeEmptyDOMElement();
  });
});

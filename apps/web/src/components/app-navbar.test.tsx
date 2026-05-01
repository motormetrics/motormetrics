import { render } from "@testing-library/react";
import { AppNavbar } from "@web/components/app-navbar";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("AppNavbar", () => {
  it("should render correctly", () => {
    render(<AppNavbar />);
  });
});

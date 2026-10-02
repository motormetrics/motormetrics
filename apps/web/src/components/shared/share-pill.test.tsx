import { SharePill } from "@web/components/shared/share-pill";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/coe",
}));

vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));

describe("SharePill", () => {
  it("should render the Share trigger", async () => {
    const screen = await render(
      createElement(SharePill, { title: "Latest COE results" }),
    );

    await expect
      .element(screen.getByRole("button", { name: "Share" }))
      .toBeInTheDocument();
  });

  it("should show the social targets and copy link when opened", async () => {
    const screen = await render(
      createElement(SharePill, { title: "Latest COE results" }),
    );

    await screen.getByRole("button", { name: "Share" }).click();

    for (const label of [
      "WhatsApp",
      "Telegram",
      "X",
      "LinkedIn",
      "Copy link",
    ]) {
      await expect
        .element(screen.getByRole("menuitem", { name: label }))
        .toBeInTheDocument();
    }
  });
});

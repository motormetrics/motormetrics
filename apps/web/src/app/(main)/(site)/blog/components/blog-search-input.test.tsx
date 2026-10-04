import { BlogSearchInput } from "@web/app/(main)/(site)/blog/components/blog-search-input";
import {
  type OnUrlUpdateFunction,
  withNuqsTestingAdapter,
} from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

const renderInput = (onUrlUpdate: OnUrlUpdateFunction, q = "") =>
  render(<BlogSearchInput />, {
    wrapper: withNuqsTestingAdapter({
      searchParams: q ? { q } : {},
      onUrlUpdate,
      rateLimitFactor: 0,
    }),
  });

const lastQuery = (onUrlUpdate: ReturnType<typeof vi.fn>) =>
  onUrlUpdate.mock.lastCall?.[0].searchParams.get("q") ?? null;

describe("BlogSearchInput", () => {
  it("should write the typed query to ?q", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    const screen = await renderInput(onUrlUpdate);

    await screen
      .getByRole("searchbox", { name: "Search blog posts" })
      .fill("coe");

    await expect.poll(() => lastQuery(onUrlUpdate)).toBe("coe");
  });

  it("should clear ?q from the clear button", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    const screen = await renderInput(onUrlUpdate, "coe");

    await // The clear button is the only button the field renders.
    await screen.getByRole("button").click();

    await expect.poll(() => onUrlUpdate.mock.calls.length).toBeGreaterThan(0);
    expect(lastQuery(onUrlUpdate)).toBeNull();
  });

  it("should clear ?q on Escape", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    const screen = await renderInput(onUrlUpdate, "coe");

    await screen.getByRole("searchbox", { name: "Search blog posts" }).click();
    await userEvent.keyboard("{Escape}");

    await expect.poll(() => onUrlUpdate.mock.calls.length).toBeGreaterThan(0);
    expect(lastQuery(onUrlUpdate)).toBeNull();
  });
});

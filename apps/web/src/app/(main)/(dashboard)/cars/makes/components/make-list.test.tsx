import {
  MakeList,
  type MakeListRow,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-list";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));

// `next/form` needs the app router. A plain form keeps the GET submission the
// component relies on, which the tests read back before it navigates.
vi.mock("next/form", async () => {
  const { forwardRef } = await import("react");
  const MockForm = forwardRef<
    HTMLFormElement,
    ComponentProps<"form"> & {
      prefetch?: boolean;
      replace?: boolean;
      scroll?: boolean;
    }
  >(
    (
      { prefetch: _prefetch, replace: _replace, scroll: _scroll, ...props },
      ref,
    ) => <form ref={ref} {...props} />,
  );
  // `next/form` is pre-bundled CommonJS, so its default import can resolve to
  // the module object itself; spreading the mock makes that a component too.
  return { ...MockForm, default: MockForm };
});

const row = (make: string, slug: string, compareHref?: string) =>
  ({
    change: "+1.0%",
    compareHref,
    count: 100,
    href: `/cars/makes/${slug}`,
    logoUrl: null,
    make,
    slug,
  }) satisfies MakeListRow;

const renderList = (rows: MakeListRow[]) =>
  render(<MakeList changeHeading="On 2025" rows={rows} />, {
    wrapper: withNuqsTestingAdapter({ rateLimitFactor: 0 }),
  });

/** The URL a GET form submission opens, captured instead of navigating. */
function captureSubmit() {
  const submitted: string[] = [];
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const query = new URLSearchParams(
      new FormData(form) as unknown as Record<string, string>,
    );
    submitted.push(`${form.getAttribute("action")}?${query}`);
  };
  document.addEventListener("submit", onSubmit, true);
  return {
    release: () => document.removeEventListener("submit", onSubmit, true),
    submitted,
  };
}

describe("MakeList", () => {
  let release = () => {};

  afterEach(() => release());

  it("should link each make to its own page outside compare mode", async () => {
    const screen = await renderList([
      row("BMW", "bmw"),
      row("TOYOTA", "toyota"),
    ]);

    await expect
      .element(screen.getByRole("link", { name: "TOYOTA" }))
      .toHaveAttribute("href", "/cars/makes/toyota");
    expect(screen.getByRole("button", { name: /Compare with/ }).all()).toEqual(
      [],
    );
  });

  it("should make a comparison pick a button, never a link", async () => {
    const screen = await renderList([
      row("BMW", "bmw"),
      row("TOYOTA", "toyota", "/cars/makes/compare?make=bmw&make=toyota"),
    ]);

    await expect
      .element(screen.getByRole("button", { name: "Compare with TOYOTA" }))
      .toBeVisible();
    expect(screen.getByRole("link", { name: "TOYOTA" }).all()).toEqual([]);
    // The selected make itself keeps its page link.
    await expect
      .element(screen.getByRole("link", { name: "BMW" }))
      .toHaveAttribute("href", "/cars/makes/bmw");
  });

  it("should open the comparison when a pick is pressed", async () => {
    const capture = captureSubmit();
    release = capture.release;
    const screen = await renderList([
      row("BMW", "bmw"),
      row("TOYOTA", "toyota", "/cars/makes/compare?make=bmw&make=toyota"),
    ]);

    await screen.getByRole("button", { name: "Compare with TOYOTA" }).click();

    await vi.waitFor(() =>
      expect(capture.submitted).toEqual([
        "/cars/makes/compare?make=bmw&make=toyota",
      ]),
    );
  });
});

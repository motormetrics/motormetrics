import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE } from "@web/config";
import type { Organization, WithContext } from "schema-dts";
import { vi } from "vitest";
import { render } from "vitest-browser-react";

// The browser mocker hands a CommonJS dependency's whole factory result to a
// default import, so the mock itself must be a valid element type.
vi.mock("next/script", async () => {
  const { forwardRef } = await import("react");
  const MockScript = forwardRef<HTMLScriptElement, Record<string, unknown>>(
    (props, ref) => <script ref={ref} {...props} />,
  );
  return { ...MockScript, default: MockScript };
});

describe("StructuredData", () => {
  it("should inject JSON-LD script", async () => {
    const data: WithContext<Organization> = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_TITLE,
    };

    const screen = await render(<StructuredData data={data} />);
    expect(screen.container).toMatchSnapshot();
    const script = screen.container.querySelector(
      "script#structured-data",
    ) as HTMLScriptElement;

    expect(script).toBeTruthy();
    expect(script.textContent).toContain(SITE_TITLE);
  });
});

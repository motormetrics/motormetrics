import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE } from "@web/config";
import type { Organization, WithContext } from "schema-dts";
import { render } from "vitest-browser-react";

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
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement;

    expect(script).toBeTruthy();
    expect(script.textContent).toContain(SITE_TITLE);
  });

  it("should escape < so the payload cannot close the script tag", async () => {
    const data: WithContext<Organization> = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "</script><b>x</b>",
    };

    const screen = await render(<StructuredData data={data} />);
    const script = screen.container.querySelector(
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement;

    expect(script.textContent).not.toContain("<");
    expect(JSON.parse(script.textContent ?? "")).toEqual(data);
  });
});

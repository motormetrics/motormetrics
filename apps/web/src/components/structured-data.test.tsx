import { render } from "@testing-library/react";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE } from "@web/config";
import type { Organization, WithContext } from "schema-dts";
import { vi } from "vitest";

vi.mock("next/script", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <script {...props} />,
}));

describe("StructuredData", () => {
  it("should inject JSON-LD script", () => {
    const data: WithContext<Organization> = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_TITLE,
    };

    const { container } = render(<StructuredData data={data} />);
    expect(container).toMatchSnapshot();
    const script = container.querySelector(
      "script#structured-data",
    ) as HTMLScriptElement;

    expect(script).toBeTruthy();
    expect(script.textContent).toContain(SITE_TITLE);
  });
});

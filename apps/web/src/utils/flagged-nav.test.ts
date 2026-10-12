import { footerNavItems, moreNavItems } from "@web/utils/flagged-nav";

describe("moreNavItems", () => {
  it("should include About and Blog when the advertise flag is off", () => {
    expect(moreNavItems({ advertise: false })).toEqual([
      { title: "About", url: "/about" },
      { title: "Blog", url: "/blog" },
    ]);
  });

  it("should append Advertise when the advertise flag is on", () => {
    expect(moreNavItems({ advertise: true })).toEqual([
      { title: "About", url: "/about" },
      { title: "Blog", url: "/blog" },
      { title: "Advertise", url: "/advertise" },
    ]);
  });
});

describe("footerNavItems", () => {
  it("should keep Advertise out of the footer when the nav flag is off", () => {
    expect(
      footerNavItems({ advertise: false }).map(({ href }) => href),
    ).toEqual([
      "/about",
      "/learn",
      "/contact",
      "/legal/privacy-policy",
      "/legal/terms-of-service",
    ]);
  });

  it("should insert Advertise after Learn when the nav flag is on", () => {
    expect(footerNavItems({ advertise: true }).map(({ href }) => href)).toEqual(
      [
        "/about",
        "/learn",
        "/advertise",
        "/contact",
        "/legal/privacy-policy",
        "/legal/terms-of-service",
      ],
    );
  });
});

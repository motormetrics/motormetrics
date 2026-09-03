import { brandSameAs, SOCIAL_URLS } from "@web/config/socials";
import { footerNavItems, moreNavItems } from "@web/utils/flagged-nav";

describe("moreNavItems", () => {
  it("should include About only when advertise and blog flags are off", () => {
    expect(moreNavItems({ advertise: false, blog: false })).toEqual([
      { title: "About", url: "/about" },
    ]);
  });

  it("should append Advertise and Blog when those flags are on", () => {
    expect(moreNavItems({ advertise: true, blog: true })).toEqual([
      { title: "About", url: "/about" },
      { title: "Advertise", url: "/advertise" },
      { title: "Blog", url: "/blog" },
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

describe("brandSameAs", () => {
  it("should return Instagram, Telegram, and GitHub when social-links is on", () => {
    expect(brandSameAs(true)).toEqual([
      SOCIAL_URLS.instagram,
      SOCIAL_URLS.telegram,
      SOCIAL_URLS.github,
    ]);
  });

  it("should return no profile URLs when social-links is off", () => {
    expect(brandSameAs(false)).toEqual([]);
  });
});

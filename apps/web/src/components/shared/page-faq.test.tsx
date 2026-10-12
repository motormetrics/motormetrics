import { type Faq, PageFaq } from "@web/components/shared/page-faq";
import { render } from "vitest-browser-react";

const FAQS: Faq[] = [
  {
    question: "How is the PARF rebate calculated?",
    answer: "It is a percentage of the ARF paid, set by the car's age.",
  },
  {
    question: "What is the difference between Cat A and Cat B?",
    answer: "Category A is for smaller cars; Category B for larger ones.",
  },
];

describe("PageFaq", () => {
  it("should render every question under the section heading", async () => {
    const screen = await render(<PageFaq faqs={FAQS} />);

    await expect
      .element(screen.getByRole("heading", { name: "Common questions" }))
      .toBeInTheDocument();
    for (const { question } of FAQS) {
      await expect
        .element(screen.getByRole("button", { name: question }))
        .toBeInTheDocument();
    }
  });

  it("should keep every question collapsed by default", async () => {
    const screen = await render(<PageFaq faqs={FAQS} />);

    for (const { question } of FAQS) {
      await expect
        .element(screen.getByRole("button", { name: question }))
        .toHaveAttribute("aria-expanded", "false");
    }
  });

  it("should keep the collapsed answers in the DOM for crawlers", async () => {
    const screen = await render(<PageFaq faqs={FAQS} />);

    for (const { answer } of FAQS) {
      expect(screen.container.textContent).toContain(answer);
    }
  });

  it("should expand the first question when expandFirst is set", async () => {
    const screen = await render(<PageFaq expandFirst faqs={FAQS} />);

    await expect
      .element(screen.getByRole("button", { name: FAQS[0].question }))
      .toHaveAttribute("aria-expanded", "true");
    await expect
      .element(screen.getByRole("button", { name: FAQS[1].question }))
      .toHaveAttribute("aria-expanded", "false");
  });

  it("should expand a question when it is selected", async () => {
    const screen = await render(<PageFaq faqs={FAQS} />);
    const trigger = screen.getByRole("button", { name: FAQS[1].question });

    await trigger.click();

    await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
    await expect.element(screen.getByText(FAQS[1].answer)).toBeVisible();
  });
});

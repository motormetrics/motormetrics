import { GoBackButton } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/go-back-button";
import { render } from "vitest-browser-react";

describe("GoBackButton", () => {
  it("should call history.back when pressed", async () => {
    const historyBackSpy = vi
      .spyOn(history, "back")
      .mockImplementation(() => {});
    const screen = await render(<GoBackButton />);

    await screen.getByRole("button", { name: /go back/i }).click();
    expect(historyBackSpy).toHaveBeenCalled();

    historyBackSpy.mockRestore();
  });
});

import { render } from "@testing-library/react";
import { BonesCaptureRuntime } from "./bones-capture-runtime";

describe("BonesCaptureRuntime", () => {
  it("should render nothing outside next dev", () => {
    const { container } = render(<BonesCaptureRuntime />);

    expect(container).toBeEmptyDOMElement();
  });
});

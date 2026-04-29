import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AllMakes } from "./all-makes";

describe("Makes", () => {
  const germanMakes = ["AUDI", "BMW", "MERCEDES BENZ", "PORSCHE"];

  const groupedGerman: Record<string, string[]> = {
    A: ["AUDI"],
    B: ["BMW"],
    M: ["MERCEDES BENZ"],
    P: ["PORSCHE"],
  };

  const lettersGerman = ["ALL", "A", "B", "M", "P"];

  it("should render the section with title and count", () => {
    render(
      <AllMakes
        title="Test Makes"
        sortedMakes={germanMakes}
        groupedMakes={groupedGerman}
        letters={lettersGerman}
      />,
    );
    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByText("Test Makes")).toBeVisible();
    expect(screen.getByText(germanMakes.length.toString())).toBeVisible();
  });

  it("should render all makes when ALL is selected by default", () => {
    render(
      <AllMakes
        title="Test Makes"
        sortedMakes={germanMakes}
        groupedMakes={groupedGerman}
        letters={lettersGerman}
      />,
    );
    germanMakes.forEach((make) => {
      expect(screen.getByText(make)).toBeVisible();
    });
  });

  it("should render nothing when no makes exist", () => {
    const { container } = render(
      <AllMakes
        title="Test Makes"
        sortedMakes={[]}
        groupedMakes={{}}
        letters={["ALL"]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  describe("All Makes", () => {
    it("should render all makes section with letter filter", () => {
      render(
        <AllMakes
          title="All Makes"
          sortedMakes={germanMakes}
          groupedMakes={groupedGerman}
          letters={lettersGerman}
        />,
      );
      expect(screen.getByText("All Makes")).toBeVisible();
      expect(screen.getByText(germanMakes.length.toString())).toBeVisible();
      expect(screen.getByRole("button", { name: "ALL" })).toBeVisible();
    });

    it("should default to the All tab", () => {
      render(
        <AllMakes
          title="All Makes"
          sortedMakes={germanMakes}
          groupedMakes={groupedGerman}
          letters={lettersGerman}
        />,
      );
      const allButton = screen.getByRole("button", { name: "ALL" });
      expect(allButton).toHaveClass("bg-primary");
      germanMakes.forEach((make) => {
        expect(screen.getByText(make)).toBeVisible();
      });
    });

    it("should filter makes when selecting a specific letter", async () => {
      render(
        <AllMakes
          title="All Makes"
          sortedMakes={germanMakes}
          groupedMakes={groupedGerman}
          letters={lettersGerman}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "B" }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "B" })).toHaveClass(
          "bg-primary",
        );
      });

      await waitFor(() => {
        expect(screen.getByText("BMW")).toBeVisible();
      });

      expect(screen.queryByText("AUDI")).not.toBeInTheDocument();
    });
  });

  it("should show Other for # letter category", async () => {
    const mixedMakes = ["123MOTORS", "AUDI"];
    const groupedMixed: Record<string, string[]> = {
      "#": ["123MOTORS"],
      A: ["AUDI"],
    };
    const lettersMixed = ["ALL", "A", "#"];

    render(
      <AllMakes
        title="All Makes"
        sortedMakes={mixedMakes}
        groupedMakes={groupedMixed}
        letters={lettersMixed}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "#" }));

    await waitFor(() => {
      expect(screen.getByText("Other")).toBeVisible();
    });

    await waitFor(() => {
      expect(screen.getByText("123MOTORS")).toBeVisible();
    });
  });
});

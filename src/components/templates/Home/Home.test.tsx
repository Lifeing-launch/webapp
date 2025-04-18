import { render, screen } from "@testing-library/react";
import Home from "./Home";

describe("Home Component", () => {
  it("renders the page title", () => {
    render(<Home />);
    const logo = screen.getByText("Lifeing");
    expect(logo).toBeInTheDocument();
  });

  it('renders the "Read our docs" link', () => {
    render(<Home />);
    const link = screen.getByText("Read our docs");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
    );
  });
});

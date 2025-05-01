import { render, screen } from "@testing-library/react";
import { FormMessage } from "./form-message";

describe("FormMessage Component", () => {
  it("renders success message when message.success is provided", () => {
    render(<FormMessage message={{ success: "Operation successful!" }} />);

    expect(screen.getByText("Operation successful!")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveClass("border-primary");
  });

  it("renders error message when message.error is provided", () => {
    render(<FormMessage message={{ error: "Something went wrong!" }} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveClass("border-destructive");
  });

  it("renders nothing when no message is provided", () => {
    const { container } = render(<FormMessage message={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when message is undefined", () => {
    const { container } = render(<FormMessage />);
    expect(container.firstChild).toBeNull();
  });
});

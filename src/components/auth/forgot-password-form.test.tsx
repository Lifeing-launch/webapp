import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ForgotPasswordForm from "./forgot-password-form";
import { sendPasswordResetEmailAction } from "@/utils/supabase/actions";

// Mock dependencies
jest.mock("@/utils/supabase/actions", () => ({
  sendPasswordResetEmailAction: jest.fn(),
}));

describe("ForgotPasswordForm", () => {
  it("renders the ForgotPasswordForm component", () => {
    render(<ForgotPasswordForm searchParams={{}} />);
    expect(screen.getByText("Forgot Password")).toBeInTheDocument();
    expect(
      screen.getByText(
        "If your email is registered, you'll receive a reset link."
      )
    ).toBeInTheDocument();
  });

  it("renders form message", () => {
    const message = "This is a success message";
    render(<ForgotPasswordForm searchParams={{ success: message }} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("renders the email input field", () => {
    render(<ForgotPasswordForm searchParams={{}} />);
    expect(
      screen.getByLabelText("Enter your email address")
    ).toBeInTheDocument();
  });

  it("allows typing into the email input field", () => {
    render(<ForgotPasswordForm searchParams={{}} />);
    const emailInput = screen.getByLabelText("Enter your email address");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("renders the submit button with correct text", () => {
    render(<ForgotPasswordForm searchParams={{}} />);
    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });
    expect(submitButton).toBeInTheDocument();
  });

  it("renders the 'Back to login' link", () => {
    render(<ForgotPasswordForm searchParams={{}} />);
    const backToLoginLink = screen.getByText("Back to login");
    expect(backToLoginLink).toBeInTheDocument();
    expect(backToLoginLink).toHaveAttribute("href", "/login");
  });

  it("does not call sendPasswordResetEmailAction without an email", () => {
    render(<ForgotPasswordForm searchParams={{}} />);
    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });

    fireEvent.click(submitButton);
    expect(sendPasswordResetEmailAction).not.toHaveBeenCalled();
  });

  it("calls sendPasswordResetEmailAction with a valid email", () => {
    render(<ForgotPasswordForm searchParams={{}} />);
    const emailInput = screen.getByLabelText("Enter your email address");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });
    fireEvent.click(submitButton);

    expect(sendPasswordResetEmailAction).toHaveBeenCalled();
  });
});

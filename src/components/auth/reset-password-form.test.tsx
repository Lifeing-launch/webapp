import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ResetPasswordForm from "./reset-password-form";
import { updatePasswordAction } from "@/utils/supabase/actions";

// Mock dependencies
jest.mock("@/utils/supabase/actions", () => ({
  updatePasswordAction: jest.fn(),
}));

describe("ResetPasswordForm", () => {
  it("renders the ResetPasswordForm component", () => {
    render(<ResetPasswordForm searchParams={{}} />);
    expect(screen.getByText("Reset Your Password")).toBeInTheDocument();
  });

  it("renders form message", () => {
    const message = "This is a success message";
    render(<ResetPasswordForm searchParams={{ success: message }} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("renders the new password input field", () => {
    render(<ResetPasswordForm searchParams={{}} />);
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
  });

  it("renders the confirm password input field", () => {
    render(<ResetPasswordForm searchParams={{}} />);
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("allows typing into the new password input field", () => {
    render(<ResetPasswordForm searchParams={{}} />);
    const passwordInput = screen.getByLabelText("New Password");

    fireEvent.change(passwordInput, { target: { value: "newpassword123" } });
    expect(passwordInput).toHaveValue("newpassword123");
  });

  it("allows typing into the confirm password input field", () => {
    render(<ResetPasswordForm searchParams={{}} />);
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    fireEvent.change(confirmPasswordInput, {
      target: { value: "newpassword123" },
    });
    expect(confirmPasswordInput).toHaveValue("newpassword123");
  });

  it("renders the submit button with correct text", () => {
    render(<ResetPasswordForm searchParams={{}} />);
    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    expect(submitButton).toBeInTheDocument();
  });

  it("does not call updatePasswordAction if required fields are empty", () => {
    render(<ResetPasswordForm searchParams={{}} />);
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    fireEvent.click(submitButton);
    expect(updatePasswordAction).not.toHaveBeenCalled();
  });

  it("calls updatePasswordAction with valid inputs", () => {
    render(<ResetPasswordForm searchParams={{}} />);
    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    fireEvent.change(passwordInput, { target: { value: "newpassword123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "newpassword123" },
    });

    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    fireEvent.click(submitButton);

    expect(updatePasswordAction).toHaveBeenCalled();
  });
});

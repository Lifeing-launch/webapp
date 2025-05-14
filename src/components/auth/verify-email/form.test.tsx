import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  verifySignupOtpAction,
  resendOTPAction,
} from "@/utils/supabase/actions";
import VerifyEmailForm from "./form";

// Mock dependencies
jest.mock("@/utils/supabase/actions", () => ({
  verifySignupOtpAction: jest.fn(),
  resendOTPAction: jest.fn(),
}));

describe("VerifyEmailForm", () => {
  it("renders the VerifyEmailForm component", () => {
    render(<VerifyEmailForm email="test@example.com" />);
    expect(screen.getByText("Verify your email")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We sent you a six digit confirmation code to test@example.com. Please enter it below to confirm your email address."
      )
    ).toBeInTheDocument();
  });

  it("renders form message", () => {
    const message = "This is a success message";
    render(
      <VerifyEmailForm
        email="test@example.com"
        searchParams={{ success: message }}
      />
    );
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("renders the OTP input fields", () => {
    render(<VerifyEmailForm email="test@example.com" />);
    const otpInput = screen.getByRole("textbox");
    expect(otpInput).toBeInTheDocument();
  });

  it("renders the submit button with correct text", () => {
    render(<VerifyEmailForm email="test@example.com" />);
    const submitButton = screen.getByRole("button", { name: "Verify" });
    expect(submitButton).toBeInTheDocument();
  });

  it("without required OTP verifySignupOtpAction is not called on form submission", () => {
    render(<VerifyEmailForm email="test@example.com" />);
    const submitButton = screen.getByRole("button", { name: "Verify" });

    fireEvent.click(submitButton);
    expect(verifySignupOtpAction).not.toHaveBeenCalled();
  });

  it("with required OTP verifySignupOtpAction is called on form submission", () => {
    render(<VerifyEmailForm email="test@example.com" />);
    const otpInput = screen.getByRole("textbox");

    fireEvent.change(otpInput, { target: { value: "123456" } });

    const submitButton = screen.getByRole("button", { name: "Verify" });
    fireEvent.click(submitButton);

    expect(verifySignupOtpAction).toHaveBeenCalled();
  });

  it("calls resendOTPAction when resend code is clicked", () => {
    render(<VerifyEmailForm email="test@example.com" />);
    const resendButton = screen.getByText("Send code again");

    fireEvent.click(resendButton);

    expect(resendOTPAction).toHaveBeenCalledWith("test@example.com");
  });
});

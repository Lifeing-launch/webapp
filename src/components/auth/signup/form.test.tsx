import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SignupForm } from "./form";
import { signUpAction } from "@/utils/supabase/actions";

// Mock dependencies
jest.mock("@/utils/supabase/actions", () => ({
  signUpAction: jest.fn(),
}));

describe("SignupForm", () => {
  it("renders the SignupForm component", () => {
    render(<SignupForm className="test-class" />);
    expect(screen.getByText("Create Your Account")).toBeInTheDocument();
    expect(
      screen.getByText("Start Your 10-Day Free Trial")
    ).toBeInTheDocument();
  });

  it("renders form message", () => {
    const message = "This is a success message";
    render(<SignupForm searchParams={{ success: message }} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("renders all input fields", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("allows typing into all input fields", () => {
    render(<SignupForm />);
    const firstNameInput = screen.getByLabelText("First Name");
    const lastNameInput = screen.getByLabelText("Last Name");
    const emailInput = screen.getByLabelText("Email address");
    const passwordInput = screen.getByLabelText("Password");
    const cPasswordInput = screen.getByLabelText("Confirm Password");

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    fireEvent.change(emailInput, { target: { value: "john.doe@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(cPasswordInput, { target: { value: "password123" } });

    expect(firstNameInput).toHaveValue("John");
    expect(lastNameInput).toHaveValue("Doe");
    expect(emailInput).toHaveValue("john.doe@example.com");
    expect(passwordInput).toHaveValue("password123");
    expect(cPasswordInput).toHaveValue("password123");
  });

  it("renders the submit button with correct text", () => {
    render(<SignupForm />);
    const submitButton = screen.getByRole("button", { name: "Sign up" });
    expect(submitButton).toBeInTheDocument();
  });

  it("renders the 'Login' link", () => {
    render(<SignupForm />);
    const loginLink = screen.getByText("Login");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("without required fields signUpAction is not called on form submission", () => {
    render(<SignupForm />);
    const submitButton = screen.getByRole("button", { name: "Sign up" });

    fireEvent.click(submitButton);
    expect(signUpAction).not.toHaveBeenCalled();
  });

  it("with required fields signUpAction is called on form submission", () => {
    render(<SignupForm />);
    const firstNameInput = screen.getByLabelText("First Name");
    const lastNameInput = screen.getByLabelText("Last Name");
    const emailInput = screen.getByLabelText("Email address");
    const passwordInput = screen.getByLabelText("Password");
    const cPasswordInput = screen.getByLabelText("Confirm Password");

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    fireEvent.change(emailInput, { target: { value: "john.doe@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(cPasswordInput, { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: "Sign up" });
    fireEvent.click(submitButton);

    expect(signUpAction).toHaveBeenCalled();
  });
});

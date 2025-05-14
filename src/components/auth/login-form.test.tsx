import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginForm } from "./login-form";
import { loginAction } from "@/utils/supabase/actions";

// Mock dependencies
jest.mock("@/utils/supabase/actions", () => ({
  loginAction: jest.fn(),
}));

describe("LoginForm", () => {
  it("renders the LoginForm component", () => {
    render(<LoginForm className="test-class" />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(
      screen.getByText("Login to your Lifeing account")
    ).toBeInTheDocument();
  });

  it("renders form message", () => {
    const message = "This is a success message";
    render(<LoginForm searchParams={{ success: message }} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("renders email and password input fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("allows typing into email and password fields", () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("renders the submit button with correct text", () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole("button", { name: "Login" });
    expect(submitButton).toBeInTheDocument();
  });

  it("renders the 'Forgot your password?' link", () => {
    render(<LoginForm />);
    const forgotPasswordLink = screen.getByText("Forgot your password?");
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });

  it("renders the 'Sign up' link", () => {
    render(<LoginForm />);
    const signUpLink = screen.getByText("Sign up");
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/signup");
  });

  it("renders the 'Login with Facebook' button", () => {
    render(<LoginForm />);
    const facebookButton = screen.getByRole("button", {
      name: /login with facebook/i,
    });
    expect(facebookButton).toBeInTheDocument();
  });

  it("without required fields loginAction is not called on form submission ", () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole("button", { name: "Login" });

    fireEvent.click(submitButton);
    expect(loginAction).not.toHaveBeenCalled();
  });

  it("with required fields loginAction is called on form submission", () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: "Login" });
    fireEvent.click(submitButton);

    expect(loginAction).toHaveBeenCalled();
  });
});

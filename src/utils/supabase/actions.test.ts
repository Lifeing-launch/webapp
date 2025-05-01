import {
  loginAction,
  signUpAction,
  verifyOtpAction,
  signOutAction,
} from "./actions";
import { createClient } from "./server";
import {
  setSecureCookie,
  getSecureCookie,
  deleteSecureCookie,
  VERIFICATION_EMAIL_COOKIE,
} from "../cookies";
import { redirect } from "next/navigation";
import { getAuthErrorMessage } from "./errors";
import { encodedRedirect } from "../urls";

jest.mock("./server");
jest.mock("../cookies");
jest.mock("next/navigation");
jest.mock("./errors");
jest.mock("../urls");

describe("Supabase Actions", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        verifyOtp: jest.fn(),
        signOut: jest.fn(),
      },
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    jest.clearAllMocks();
  });

  describe("loginAction", () => {
    it("should redirect to dashboard on successful login", async () => {
      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { email_confirmed_at: new Date() } },
        error: null,
      });

      await loginAction(formData);

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });

    it("should redirect to verify-email if email is not confirmed", async () => {
      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { email_confirmed_at: null } },
        error: null,
      });

      await loginAction(formData);

      expect(setSecureCookie).toHaveBeenCalledWith(
        VERIFICATION_EMAIL_COOKIE,
        "test@example.com",
        { maxAge: expect.any(Number) }
      );
      expect(redirect).toHaveBeenCalledWith("/verify-email");
    });

    it("should redirect to login with error message on failure", async () => {
      const errorMsg = "Error message";
      const redirectUrl = "redirect_url";

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { code: "auth_error" },
      });

      (getAuthErrorMessage as jest.Mock).mockReturnValue(errorMsg);
      (encodedRedirect as jest.Mock).mockReturnValue(redirectUrl);

      const result = await loginAction(formData);

      expect(result).toBe(redirectUrl);
      expect(encodedRedirect).toHaveBeenCalledWith("error", "/login", errorMsg);
      expect(getAuthErrorMessage).toHaveBeenCalledWith(
        "auth_error",
        expect.any(Object)
      );
    });
  });

  describe("signUpAction", () => {
    it("should redirect to verify-email on successful signup", async () => {
      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");
      formData.set("firstname", "John");
      formData.set("lastname", "Doe");

      mockSupabase.auth.signUp.mockResolvedValue({ error: null });

      await signUpAction(formData);

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: { data: { firstName: "John", lastName: "Doe" } },
      });
      expect(setSecureCookie).toHaveBeenCalledWith(
        VERIFICATION_EMAIL_COOKIE,
        "test@example.com",
        { maxAge: expect.any(Number) }
      );
      expect(redirect).toHaveBeenCalledWith("/verify-email");
    });

    it("should redirect to signup with error message on failure", async () => {
      const errorMsg = "Error message";
      const redirectUrl = "redirect_url";

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");
      formData.set("firstname", "John");
      formData.set("lastname", "Doe");

      mockSupabase.auth.signUp.mockResolvedValue({
        error: { code: "signup_error" },
      });

      (getAuthErrorMessage as jest.Mock).mockReturnValue(errorMsg);
      (encodedRedirect as jest.Mock).mockReturnValue(redirectUrl);

      const result = await signUpAction(formData);

      expect(result).toEqual(redirectUrl);
      expect(encodedRedirect).toHaveBeenCalledWith(
        "error",
        "/signup",
        errorMsg
      );
      expect(getAuthErrorMessage).toHaveBeenCalledWith(
        "signup_error",
        expect.any(Object)
      );
    });
  });

  describe("verifyOtpAction", () => {
    it("should redirect to plans on successful OTP verification", async () => {
      const formData = new FormData();
      formData.set("otp", "123456");

      (getSecureCookie as jest.Mock).mockResolvedValue("test@example.com");
      mockSupabase.auth.verifyOtp.mockResolvedValue({ error: null });

      await verifyOtpAction(formData);

      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
        type: "signup",
        token: "123456",
        email: "test@example.com",
      });
      expect(deleteSecureCookie).toHaveBeenCalledWith(
        VERIFICATION_EMAIL_COOKIE
      );
      expect(redirect).toHaveBeenCalledWith("/plans");
    });

    it("should redirect to verify-email with error message on failure", async () => {
      const errorMsg = "Error message";
      const redirectUrl = "redirect_url";

      const formData = new FormData();
      formData.set("otp", "123456");

      (getSecureCookie as jest.Mock).mockResolvedValue("test@example.com");
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        error: { code: "otp_error" },
      });

      (getAuthErrorMessage as jest.Mock).mockReturnValue(errorMsg);
      (encodedRedirect as jest.Mock).mockReturnValue(redirectUrl);

      const result = await verifyOtpAction(formData);

      expect(result).toEqual(redirectUrl);
      expect(encodedRedirect).toHaveBeenCalledWith(
        "error",
        "/verify-email",
        errorMsg
      );
      expect(getAuthErrorMessage).toHaveBeenCalledWith(
        "otp_error",
        expect.any(Object)
      );
    });
  });

  describe("signOutAction", () => {
    it("should sign out and redirect to login", async () => {
      await signOutAction();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(deleteSecureCookie).toHaveBeenCalledWith(
        VERIFICATION_EMAIL_COOKIE
      );
      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });
});

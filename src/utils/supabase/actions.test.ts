import {
  loginAction,
  signUpAction,
  verifySignupOtpAction,
  signOutAction,
} from "./actions";
import { createAdminClient, createClient } from "./server";
import {
  setSecureCookie,
  getSecureCookie,
  deleteSecureCookie,
  VERIFICATION_EMAIL_COOKIE,
} from "../cookies";
import { redirect } from "next/navigation";
import { ERROR_CODE_EMAIL_NOT_CONFIRMED, getAuthErrorMessage } from "./errors";
import { encodedRedirect } from "../urls";

jest.mock("./server");
jest.mock("../cookies");
jest.mock("next/navigation");
jest.mock("./errors");
jest.mock("../urls");

describe("Supabase Actions", () => {
  let mockSupabase: any, mockSupabaseAdmin: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        verifyOtp: jest.fn(),
        signOut: jest.fn(),
        resend: jest.fn(),
      },
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    mockSupabaseAdmin = {
      from: jest.fn(),
    };
    (createAdminClient as jest.Mock).mockReturnValue(mockSupabaseAdmin);
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
        data: null,
        error: { code: ERROR_CODE_EMAIL_NOT_CONFIRMED },
      });

      mockSupabase.auth.resend.mockResolvedValue({
        data: {},
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

    it("should redirect to login with resend error message if attempt to resend confirmation fails", async () => {
      const errorMsg = "Error message";
      const redirectUrl = "redirect_url";
      const resendError = "resend_error";

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { code: ERROR_CODE_EMAIL_NOT_CONFIRMED },
      });

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { code: resendError },
      });

      (getAuthErrorMessage as jest.Mock).mockReturnValue(errorMsg);
      (encodedRedirect as jest.Mock).mockReturnValue(redirectUrl);

      const result = await loginAction(formData);

      expect(result).toBe(redirectUrl);
      expect(setSecureCookie).not.toHaveBeenCalled();
      expect(encodedRedirect).toHaveBeenCalledWith("/login", errorMsg);
      expect(getAuthErrorMessage).toHaveBeenCalledWith(
        resendError,
        expect.any(Object)
      );
    });

    it("should redirect to login with login error message on login itself fails", async () => {
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
      expect(encodedRedirect).toHaveBeenCalledWith("/login", errorMsg);
      expect(getAuthErrorMessage).toHaveBeenCalledWith(
        "auth_error",
        expect.any(Object)
      );
    });
  });

  describe("signUpAction", () => {
    it.each([
      [{ data: null, error: null }],
      [
        {
          data: null,
          error: {
            code: "PGRST116",
            message: "No record found for this email",
          },
        },
      ],
    ])(
      "should redirect to verify-email on user doesn't already exist and successful signup: userExistsResponse=%s",
      async (userExistsResponse) => {
        const formData = new FormData();
        formData.set("email", "test@example.com");
        formData.set("password", "password123");
        formData.set("cPassword", "password123");
        formData.set("firstname", "John");
        formData.set("lastname", "Doe");

        mockSupabase.auth.signUp.mockResolvedValue({ error: null });
        // Mock from('user_profiles').select().eq().single() response
        mockSupabaseAdmin.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(userExistsResponse),
        });

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
      }
    );

    it.each([
      [{ data: null, error: null }],
      [
        {
          data: null,
          error: {
            code: "PGRST116",
            message: "No record found for this email",
          },
        },
      ],
    ])(
      "should redirect to signup with error message on signup failure only: userExistsResponse=%s",
      async (userExistsResponse) => {
        const errorMsg = "Error message";
        const redirectUrl = "redirect_url";

        const formData = new FormData();
        formData.set("email", "test@example.com");
        formData.set("password", "password123");
        formData.set("cPassword", "password123");
        formData.set("firstname", "John");
        formData.set("lastname", "Doe");

        mockSupabase.auth.signUp.mockResolvedValue({
          error: { code: "signup_error" },
        });
        // Mock from('user_profiles').select().eq().single() response
        mockSupabaseAdmin.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(userExistsResponse),
        });

        (getAuthErrorMessage as jest.Mock).mockReturnValue(errorMsg);
        (encodedRedirect as jest.Mock).mockReturnValue(redirectUrl);

        const result = await signUpAction(formData);

        expect(result).toEqual(redirectUrl);
        expect(encodedRedirect).toHaveBeenCalledWith("/signup", errorMsg);
        expect(getAuthErrorMessage).toHaveBeenCalledWith(
          "signup_error",
          expect.any(Object)
        );
      }
    );

    it.each([
      [
        { data: {}, error: null },
        "An account with this email already exists. Please log in.",
      ],
      [
        { data: null, error: { code: "error_code", message: "error_msg" } },
        "An unknown error occurred. Please try again later.",
      ],
    ])(
      "should redirect to signup with error message based on user exists check. userExistsResponse=%s",
      async (userExistsResponse, expectedErrorMsg) => {
        const errorMsg = "Error message";
        const redirectUrl = "redirect_url";

        const formData = new FormData();
        formData.set("email", "test@example.com");
        formData.set("password", "password123");
        formData.set("cPassword", "password123");
        formData.set("firstname", "John");
        formData.set("lastname", "Doe");

        mockSupabase.auth.signUp.mockResolvedValue({ error: null });

        // Mock from('user_profiles').select().eq().single() response
        mockSupabaseAdmin.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(userExistsResponse),
        });

        (getAuthErrorMessage as jest.Mock).mockReturnValue(errorMsg);
        (encodedRedirect as jest.Mock).mockReturnValue(redirectUrl);

        const result = await signUpAction(formData);

        expect(result).toEqual(redirectUrl);
        expect(encodedRedirect).toHaveBeenCalledWith(
          "/signup",
          expectedErrorMsg
        );
        expect(setSecureCookie).not.toHaveBeenCalled();
        expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
        expect(getAuthErrorMessage).not.toHaveBeenCalled();
      }
    );
  });

  describe("verifySignupOtpAction", () => {
    it("should redirect to plans on successful OTP verification", async () => {
      const formData = new FormData();
      formData.set("otp", "123456");

      (getSecureCookie as jest.Mock).mockResolvedValue("test@example.com");
      mockSupabase.auth.verifyOtp.mockResolvedValue({ error: null });

      await verifySignupOtpAction(formData);

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

      const result = await verifySignupOtpAction(formData);

      expect(result).toEqual(redirectUrl);
      expect(encodedRedirect).toHaveBeenCalledWith("/verify-email", errorMsg);
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

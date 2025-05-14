"use server";

import { redirect } from "next/navigation";
import { encodedRedirect, getSiteUrl } from "../urls";
import { createAdminClient, createClient } from "./server";
import {
  deleteSecureCookie,
  getSecureCookie,
  setSecureCookie,
  VERIFICATION_EMAIL_COOKIE,
  VERIFICATION_EMAIL_COOKIE_AGE,
} from "../cookies";
import { ERROR_CODE_EMAIL_NOT_CONFIRMED, getAuthErrorMessage } from "./errors";

type UserExistence = "EXISTS" | "NOT_EXISTS" | "ERROR";

export const loginAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const feedbackRedirectPath = "/login";

  const supabase = await createClient();
  let { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error?.code === ERROR_CODE_EMAIL_NOT_CONFIRMED) {
    error = await redirectToEmailVerification(email);
  }

  if (error) {
    const message = getAuthErrorMessage(error.code, error);
    return encodedRedirect(feedbackRedirectPath, message);
  }

  return redirect("/dashboard");
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString().toLowerCase();
  const password = formData.get("password")?.toString();
  const firstName = formData.get("firstname")?.toString();
  const lastName = formData.get("lastname")?.toString();
  const feedbackRedirectPath = "/signup";

  if (!email || !password || !firstName || !lastName) {
    return encodedRedirect(feedbackRedirectPath, "All fields are required");
  }

  // Check if the user already exists
  const userExistence = await checkUserExists(email);
  switch (userExistence) {
    case "EXISTS":
      return encodedRedirect(
        feedbackRedirectPath,
        "An account with this email already exists. Please log in."
      );
    case "ERROR":
      return encodedRedirect(
        feedbackRedirectPath,
        "An unknown error occurred. Please try again later."
      );
    default:
      break;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName,
        lastName,
      },
    },
  });

  if (error) {
    const message = getAuthErrorMessage(error.code, error);
    return encodedRedirect(feedbackRedirectPath, message);
  } else {
    await redirectToEmailVerification(email);
  }
};

export const verifySignupOtpAction = async (formData: FormData) => {
  const otp = formData.get("otp")?.toString();
  const feedbackRedirectPath = "/verify-email";

  if (!otp) {
    return encodedRedirect(feedbackRedirectPath, "OTP is required");
  }

  const email = await getSecureCookie(VERIFICATION_EMAIL_COOKIE);
  if (!email) {
    // No verification email set in browser cookie.
    // Redirect to login as this is required.
    return redirect("/login");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: "signup",
    token: otp,
    email: email,
  });

  if (error) {
    const message = getAuthErrorMessage(error.code, error);
    return encodedRedirect(feedbackRedirectPath, message);
  }

  await deleteSecureCookie(VERIFICATION_EMAIL_COOKIE);
  return redirect("/plans");
};

export const resendOTPAction = async (email: string) => {
  const error = await resendOTP(email);
  const feedbackRedirectPath = "/verify-email";

  if (error) {
    const message = getAuthErrorMessage(error.code, error);
    return encodedRedirect(feedbackRedirectPath, message);
  }
};

export const sendPasswordResetEmailAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString()?.toLowerCase();
  const feedbackRedirectPath = "/forgot-password";

  if (!email) {
    return encodedRedirect(feedbackRedirectPath, "Email is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/reset-password`,
  });

  if (error) {
    const message = getAuthErrorMessage(error.code, error);
    return encodedRedirect(feedbackRedirectPath, message);
  }

  return encodedRedirect(
    feedbackRedirectPath,
    "If your email is registered, you'll receive a reset link shortly.",
    "success"
  );
};

export const updatePasswordAction = async (formData: FormData) => {
  const password = formData.get("password")?.toString();
  const cPassword = formData.get("cPassword")?.toString();
  const feedbackRedirectPath = "/reset-password";

  if (!password || !cPassword) {
    return encodedRedirect(feedbackRedirectPath, "All fields are required");
  }

  if (password !== cPassword) {
    return encodedRedirect(
      feedbackRedirectPath,
      "Password and confirm password must match"
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    const message = getAuthErrorMessage(error.code, error);
    return encodedRedirect(feedbackRedirectPath, message);
  }

  return redirect("/dashboard");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await deleteSecureCookie(VERIFICATION_EMAIL_COOKIE);
  return redirect("/login");
};

const redirectToEmailVerification = async (email: string) => {
  await setSecureCookie(VERIFICATION_EMAIL_COOKIE, email, {
    maxAge: VERIFICATION_EMAIL_COOKIE_AGE,
  });
  redirect("/verify-email");
};

const resendOTP = async (email: string) => {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });
  if (error) return error;
};

const checkUserExists = async (email: string): Promise<UserExistence> => {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows found, user does not exist
      return "NOT_EXISTS";
    }

    // Handle unexpected errors (e.g., network issues)
    return "ERROR";
  }

  // If data is null, the user does not exist
  return data ? "EXISTS" : "NOT_EXISTS";
};

"use server";

import { redirect } from "next/navigation";
import { encodedRedirect } from "../urls";
import { createAdminClient, createClient } from "./server";
import {
  deleteSecureCookie,
  getSecureCookie,
  setSecureCookie,
  VERIFICATION_EMAIL_COOKIE,
  VERIFICATION_EMAIL_COOKIE_AGE,
} from "../cookies";
import { ERROR_CODE_EMAIL_NOT_CONFIRMED, getAuthErrorMessage } from "./errors";
import { AuthError } from "@supabase/supabase-js";

export const loginAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  let { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error?.code === ERROR_CODE_EMAIL_NOT_CONFIRMED) {
    error = await redirectToEmailVerification(email, true);
  }

  if (error) {
    const message = getAuthErrorMessage(error.code, error);
    return encodedRedirect("/login", message);
  }

  return redirect("/dashboard");
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString().toLowerCase();
  const password = formData.get("password")?.toString();
  const firstName = formData.get("firstname")?.toString();
  const lastName = formData.get("lastname")?.toString();
  const errorRedirectPath = "/signup";

  if (!email || !password || !firstName || !lastName) {
    return encodedRedirect(errorRedirectPath, "All fields are required");
  }

  // Check if the user already exists
  try {
    const userExists = await checkUserExists(email);
    if (userExists) {
      return encodedRedirect(
        errorRedirectPath,
        "An account with this email already exists. Please log in."
      );
    }
  } catch (e) {
    console.error("Error checking user exists", e);
    return encodedRedirect(
      errorRedirectPath,
      "An unknown error occurred. Please try again later."
    );
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
    return encodedRedirect(errorRedirectPath, message);
  } else {
    await redirectToEmailVerification(email);
  }
};

export const verifyOtpAction = async (formData: FormData) => {
  const otp = formData.get("otp")?.toString();
  if (!otp) {
    return encodedRedirect("/verify-email", "OTP is required");
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
    return encodedRedirect("/verify-email", message);
  }

  await deleteSecureCookie(VERIFICATION_EMAIL_COOKIE);
  return redirect("/plans");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await deleteSecureCookie(VERIFICATION_EMAIL_COOKIE);
  return redirect("/login");
};

const redirectToEmailVerification = async (
  email: string,
  resendOtp = false
): Promise<AuthError | null> => {
  if (resendOtp) {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) return error;
  }

  await setSecureCookie(VERIFICATION_EMAIL_COOKIE, email, {
    maxAge: VERIFICATION_EMAIL_COOKIE_AGE,
  });
  redirect("/verify-email");
};

const checkUserExists = async (email: string): Promise<boolean> => {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows found, user does not exist
      return false;
    }

    // Handle unexpected errors (e.g., network issues)
    throw new Error(`Error checking user existence: ${error.message}`);
  }

  // If data is null, the user does not exist
  return !!data;
};

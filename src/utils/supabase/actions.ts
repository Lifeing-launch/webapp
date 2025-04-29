"use server";

import { redirect } from "next/navigation";
import { encodedRedirect } from "../urls";
import { createClient } from "./server";
import {
  deleteSecureCookie,
  getSecureCookie,
  setSecureCookie,
  VERIFICATION_EMAIL_COOKIE,
  VERIFICATION_EMAIL_COOKIE_AGE,
} from "../cookies";

export const loginAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // TODO: validate if this includes user readable errors
    // TODO: Map error codes to user readable errors
    console.error(error.message, error);
    return encodedRedirect("error", "/login", error.message);
  }

  if (!user?.email_confirmed_at) {
    await setSecureCookie(VERIFICATION_EMAIL_COOKIE, email);
    redirect("/verify-email");
  }

  return redirect("/");
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const firstName = formData.get("firstname")?.toString();
  const lastName = formData.get("lastname")?.toString();

  const supabase = await createClient();

  if (!email || !password || !firstName || !lastName) {
    return encodedRedirect("error", "/signup", "All fields are required");
  }

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
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/signup", error.message);
  } else {
    await setSecureCookie(VERIFICATION_EMAIL_COOKIE, email, {
      maxAge: VERIFICATION_EMAIL_COOKIE_AGE,
    });
    redirect("/verify-email");
  }
};

export const verifyOtpAction = async (formData: FormData) => {
  const otp = formData.get("otp")?.toString();
  if (!otp) {
    return encodedRedirect("error", "/verify-email", "OTP is required");
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
    console.error(error.message);
    return encodedRedirect("error", "/verify-email", error.message);
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

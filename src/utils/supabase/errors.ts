import { AuthError } from "@supabase/supabase-js";

export function getAuthErrorMessage(code?: string, error?: AuthError): string {
  // See https://supabase.com/docs/guides/auth/debugging/error-codes for list of auth error codes
  if (!code) return "An unknown error occurred. Please try again.";

  switch (code) {
    case "invalid_credentials":
      return "Incorrect email or password.";
    case "user_already_registered":
      return "An account with this email already exists.";
    case "user_not_found":
      return "No account found with this email.";
    case "invalid_email":
      return "Please enter a valid email address.";
    case "invalid_password":
      return "Password is incorrect or does not meet the required criteria.";
    case "email_already_confirmed":
      return "This email is already confirmed. Please log in.";
    case "email_change_not_allowed":
      return "You can't change your email address right now.";
    case "expired_action_code":
    case "expired_token":
    case "expired_code":
      return "This code has expired. Please request a new one.";
    case "invalid_code":
      return "Invalid verification code. Please try again.";
    case "code_expired":
      return "Verification code expired. Please request a new one.";
    case "too_many_requests":
      return "Too many attempts. Please try again later.";
    case "confirmation_required":
      return "Please confirm your email address to continue.";
    case "mfa_required":
      return "Multi-factor authentication required.";
    case "provider_not_supported":
      return "This login provider is not supported.";
    case "session_expired":
      return "Your session has expired. Please log in again.";
    case "server_error":
    case "unexpected_error":
    case "internal_server_error": {
      console.error(`Supabase Auth server error: ${code}`, error);
      return "Something went wrong. Please try again later.";
    }
    default: {
      console.error(`Supabase Auth unknown error: ${code}`, error);
      return "An error occurred. Please check your input and try again.";
    }
  }
}

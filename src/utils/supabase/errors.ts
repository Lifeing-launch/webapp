import { AuthError } from "@supabase/supabase-js";

export function getAuthErrorMessage(code?: string, error?: AuthError): string {
  // See https://supabase.com/docs/guides/auth/debugging/error-codes for list of auth error codes
  if (!code) return "An unknown error occurred. Please try again.";

  switch (code) {
    case "anonymous_provider_disabled":
      return "Anonymous sign-ins are disabled.";
    case "bad_code_verifier":
      return "There was an issue with the code verifier. Please try again.";
    case "bad_json":
      return "The request body is not valid JSON.";
    case "bad_jwt":
      return "Invalid token. Please log in again.";
    case "bad_oauth_callback":
    case "bad_oauth_state":
      return "There was an issue with the OAuth provider. Please try again.";
    case "captcha_failed":
      return "CAPTCHA verification failed. Please try again.";
    case "conflict":
      return "A conflict occurred. Please try again later.";
    case "email_address_invalid":
      return "Invalid email address. Please use a different one.";
    case "email_address_not_authorized":
      return "Email sending is not allowed for this address.";
    case "email_exists":
      return "Email address already exists in the system.";
    case ERROR_CODE_EMAIL_NOT_CONFIRMED:
      return "Please confirm your email address to continue.";
    case "email_provider_disabled":
      return "Signups are disabled for email and password.";
    case "flow_state_expired":
    case "flow_state_not_found":
      return "Your session has expired. Please sign in again.";
    case "hook_timeout":
    case "hook_timeout_after_retry":
      return "A timeout occurred. Please try again later.";
    case "identity_already_exists":
      return "This identity is already linked to a user.";
    case "identity_not_found":
      return "Identity not found.";
    case "insufficient_aal":
      return "Multi-factor authentication is required.";
    case "invalid_credentials":
      return "Invalid login credentials. Please try again.";
    case "mfa_verification_failed":
      return "MFA verification failed. Please try again.";
    case "no_authorization":
      return "Authorization is required for this request.";
    case "not_admin":
      return "You do not have the required permissions.";
    case "otp_expired":
      return "OTP code has expired. Please request a new one.";
    case "over_email_send_rate_limit":
      return "Too many emails have been sent. Please try again later.";
    case "phone_exists":
      return "Phone number already exists in the system.";
    case "phone_not_confirmed":
      return "Please confirm your phone number to continue.";
    case "provider_disabled":
      return "This provider is disabled. Please contact support.";
    case "same_password":
      return "New password should be different from the old password";
    case "session_expired":
      return "Your session has expired. Please log in again.";
    case "signup_disabled":
      return "Signups are currently disabled.";
    case "user_not_found":
      return "User not found. Please check your details and try again.";
    case "weak_password":
      return "Your password does not meet the required strength criteria.";
    case "validation_failed":
      return "Invalid input. Please check your details and try again.";
    default: {
      console.error(`Supabase Auth unknown error: ${code}`, error);
      return "An error occurred. Please check your input and try again.";
    }
  }
}

export const ERROR_CODE_EMAIL_NOT_CONFIRMED = "email_not_confirmed";

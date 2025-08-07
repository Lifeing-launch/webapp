import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  path: string,
  message: string,
  type: "error" | "success" = "error"
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export function getSiteUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    const url = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    return url;
  }

  return "http://localhost:3000";
}

export function getStrapiBaseUrl() {
  return process.env.STRAPI_BASE_URL;
}

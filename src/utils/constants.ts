export const AUTH_PATHS: { path: string; exact?: boolean }[] = [
  { path: "/login" },
  { path: "/signup" },
  { path: "/verify-email" },
  { path: "/forgot-password" },
  { path: "/reset-password/verify" },
];

export const PUBLIC_PATHS: { path: string; exact?: boolean }[] = [
  { path: "/api/payment/stripe/webhook" },
  { path: "/api/utility" },
  { path: "/", exact: true },
];

export const FREE_TRIAL_DAYS = 21;

export const API_CONFIG = {
  STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
  STRAPI_API_KEY: process.env.STRAPI_API_TOKEN,
};

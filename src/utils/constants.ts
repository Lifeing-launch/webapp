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
];

// Cache duration constants
export const CACHE_DURATIONS = {
  COACHES: 60 * 60, // 1 hour
  PLANS: 6 * 60 * 60, // 6 hours
  RESOURCES: 15 * 60, // 15 minutes
  ARTICLES: 15 * 60, // 15 minutes
  NO_CACHE: 0, // No caching
} as const;

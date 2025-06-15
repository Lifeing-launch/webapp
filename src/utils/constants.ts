export const AUTH_PATHS: { path: string; exact?: boolean }[] = [
  { path: "/login" },
  { path: "/signup" },
  { path: "/verify-email" },
  { path: "/forgot-password" },
  { path: "/reset-password/verify" },
];

export const PUBLIC_PATHS: { path: string; exact?: boolean }[] = [
  { path: "/api" },
];

/**
 * Environment detection utilities
 */

export type Environment = "development" | "staging" | "production";

/**
 * Get the current environment
 */
export function getEnvironment(): Environment {
  // Vercel environment detection
  if (process.env.VERCEL_ENV === "production") {
    return "production";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return "staging";
  }

  // NODE_ENV check for local/non-Vercel environments
  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  // Default to development for local development
  return "development";
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnvironment() === "production";
}

/**
 * Check if running in staging
 */
export function isStaging(): boolean {
  return getEnvironment() === "staging";
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvironment() === "development";
}

/**
 * Get environment-specific configuration values
 */
export function getEnvironmentConfig<T>(config: {
  development: T;
  staging: T;
  production: T;
}): T {
  const env = getEnvironment();
  return config[env];
}

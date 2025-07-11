/**
 * Avatar utilities for the forum system
 * Centralizes avatar generation logic - simplified version
 */

/**
 * Generates initials from a username
 * Handles usernames with or without @ prefix
 */
export function generateInitials(username: string): string {
  if (!username || typeof username !== "string") {
    return "U";
  }

  // Remove @ prefix if present
  const cleanUsername = username.startsWith("@") ? username.slice(1) : username;

  // Split by spaces, underscores, dots, or hyphens
  const words = cleanUsername.split(/[\s._-]+/).filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  if (words.length === 1) {
    // Single word: take first 2 characters or first character repeated
    return words[0].length >= 2
      ? words[0].slice(0, 2).toUpperCase()
      : words[0].charAt(0).toUpperCase();
  }

  // Multiple words: take first character of first two words
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

/**
 * Gets complete avatar props for a user
 * Always uses bg-primary color as specified
 */
export function getAvatarProps(username: string) {
  return {
    initials: generateInitials(username),
    color: "bg-primary", // Fixed color as requested
  };
}

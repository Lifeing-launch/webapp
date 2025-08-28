export const FORUM_AVATAR_COLORS = [
  "#42104C", // Purple
  "#AC5118", // Brown
  "#4e6f1c", // Default sidebar color
];

/**
 * Generates a random color for forum avatars from predefined colors
 * Uses a hash of the user ID to ensure consistent color per user
 */
export function getAvatarColor(userId: string): string {
  // Simple hash function to get consistent color for each user
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const colorIndex = Math.abs(hash) % FORUM_AVATAR_COLORS.length;
  return FORUM_AVATAR_COLORS[colorIndex];
}

/**
 * Generates CSS background color style for forum avatars
 */
export function getAvatarBackgroundStyle(userId: string): React.CSSProperties {
  return {
    backgroundColor: getAvatarColor(userId),
  };
}

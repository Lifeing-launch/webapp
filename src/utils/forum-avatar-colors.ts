export const FORUM_AVATAR_COLORS = [
  "#42104c", // Purple - seção meetings/audio
  "#ac5118", // Brown - seção resources/forum
  "#4e6f1c", // Primary Green - cor padrão sidebar
];

/**
 * Improved hash function for better distribution
 * Uses FNV-1a hash algorithm for more even distribution
 */
function fnv1aHash(str: string): number {
  let hash = 0x811c9dc5; // FNV offset basis for 32-bit

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // FNV prime for 32-bit, unsigned shift
  }

  return hash;
}

/**
 * Generates a random color for forum avatars from predefined colors
 * Uses improved hash of the user ID to ensure consistent color per user
 */
export function getAvatarColor(userId: string): string {
  if (!userId || userId === "default-user") {
    // Para casos default, usar uma rotação baseada em timestamp
    const fallbackIndex =
      Math.floor(Date.now() / 1000) % FORUM_AVATAR_COLORS.length;
    return FORUM_AVATAR_COLORS[fallbackIndex];
  }

  // Usar múltiplos salts e operações para garantir distribuição uniforme
  const salts = ["avatar", "forum-colors", "lifeing-app"];
  let combinedHash = 0;

  // Aplicar múltiplos hashes com diferentes salts
  salts.forEach((salt, index) => {
    const saltedId = `${salt}-${userId}-${index}`;
    const hash = fnv1aHash(saltedId);
    combinedHash ^= hash; // XOR para combinar hashes
  });

  // Usar operações adicionais para melhorar distribuição
  combinedHash = fnv1aHash(combinedHash.toString());

  // Garantir distribuição mais uniforme usando operação modular melhorada
  // Usar multiplicação para evitar bias nos últimos índices
  const normalizedHash = (combinedHash * 2654435761) >>> 0; // Multiplicação por primo grande
  const colorIndex = normalizedHash % FORUM_AVATAR_COLORS.length;

  return FORUM_AVATAR_COLORS[colorIndex];
}

/**
 * Generates CSS background color style for forum avatars
 */
export function getAvatarBackgroundStyle(userId: string): React.CSSProperties {
  const color = getAvatarColor(userId);

  return {
    backgroundColor: color,
  };
}

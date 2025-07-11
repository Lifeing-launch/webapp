export function FallbackAvatar({ userInitials }: { userInitials: string }) {
  // Simple hash function to generate a number from userInitials
  function hashCode(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }
  // Generate HSL color from hash
  function stringToHslColor(str: string, s = 60, l = 60) {
    const hash = hashCode(str);
    const h = Math.abs(hash) % 360;
    return { h, s, l };
  }

  // Calculate contrast ratio between two colors (YIQ formula for simplicity)
  function getContrastYIQ({ h, s, l }: { h: number; s: number; l: number }) {
    // Convert HSL to RGB
    function hslToRgb(h: number, s: number, l: number) {
      s /= 100;
      l /= 100;
      const k = (n: number) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) =>
        l - a * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1));
      return [
        Math.round(255 * f(0)),
        Math.round(255 * f(8)),
        Math.round(255 * f(4)),
      ];
    }
    const [r, g, b] = hslToRgb(h, s, l);
    // YIQ formula
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  const hsl = stringToHslColor(userInitials || "??");
  const bgColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  // If background is light, use dark text; if dark, use white text
  const contrast = getContrastYIQ(hsl);
  const fontColor = contrast > 150 ? "#222" : "#fff";

  return (
    <div
      className="flex items-center justify-center w-full h-full rounded-full font-semibold tracking-wider select-none"
      style={{
        backgroundColor: bgColor,
        color: fontColor,
      }}
    >
      {userInitials || "?"}
    </div>
  );
}

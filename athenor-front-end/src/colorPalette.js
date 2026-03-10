/**
 * Color Palette Generator
 * Generates 100+ unique, accessible colors that work in both light and dark modes
 */

// High contrast color palette - HSL format for easy manipulation
// 25 unique colors that are distinguishable and work in both light/dark modes
export const BASE_COLORS = [
  { h: 0, s: 85, l: 50 },     // Red
  { h: 15, s: 85, l: 50 },    // Red-Orange
  { h: 30, s: 85, l: 50 },    // Orange
  { h: 45, s: 85, l: 50 },    // Gold
  { h: 55, s: 85, l: 50 },    // Yellow-Gold
  { h: 70, s: 85, l: 45 },    // Yellow-Green
  { h: 90, s: 85, l: 45 },    // Lime
  { h: 110, s: 85, l: 45 },   // Light Green
  { h: 130, s: 85, l: 45 },   // Green
  { h: 150, s: 85, l: 45 },   // Mint
  { h: 170, s: 85, l: 45 },   // Teal
  { h: 185, s: 85, l: 50 },   // Cyan
  { h: 200, s: 85, l: 50 },   // Light Blue
  { h: 215, s: 85, l: 50 },   // Sky Blue
  { h: 230, s: 85, l: 55 },   // Blue
  { h: 245, s: 85, l: 55 },   // Indigo
  { h: 260, s: 85, l: 55 },   // Blue-Purple
  { h: 275, s: 85, l: 55 },   // Purple
  { h: 290, s: 85, l: 55 },   // Violet
  { h: 305, s: 85, l: 50 },   // Magenta
  { h: 320, s: 85, l: 50 },   // Pink
  { h: 335, s: 85, l: 50 },   // Rose
  { h: 350, s: 85, l: 50 },   // Crimson
  { h: 25, s: 70, l: 40 },    // Brown
  { h: 195, s: 50, l: 40 },   // Steel Blue
];

/**
 * Convert HSL to Hex color
 */
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return (
    "#" +
    [f(0), f(8), f(4)]
      .map(x => {
        const hex = Math.round(255 * x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Generate a unique color for a given user index
 * Returns a consistent color that works well in both light and dark modes
 */
export function generateUserColor(userIndex) {
  // Cycle through base colors and vary saturation/lightness for more variety
  const baseColorIndex = userIndex % BASE_COLORS.length;
  const variation = Math.floor(userIndex / BASE_COLORS.length);

  const baseColor = BASE_COLORS[baseColorIndex];

  // Adjust saturation and lightness based on variation to create unique colors
  const saturation = Math.max(60, 85 - variation * 5);
  // Use a medium lightness that works well in both light and dark modes
  const lightness = 55 + (variation % 3) * 5;

  const color = hslToHex(baseColor.h, saturation, lightness);

  return {
    name: `Color-${userIndex}`,
    light: color,  // Use same color for both modes
    dark: color,   // Use same color for both modes
    hue: baseColor.h,
    saturation,
    lightnessLight: lightness,
    lightnessDark: lightness,
  };
}

/**
 * Get color for a user by index or name
 * Ensures consistent color assignment
 */
const colorCache = {};

export function getUserColor(userIdentifier) {
  // If identifier is a number (index), use it directly
  if (typeof userIdentifier === 'number') {
    if (!colorCache[userIdentifier]) {
      colorCache[userIdentifier] = generateUserColor(userIdentifier);
    }
    return colorCache[userIdentifier];
  }

  // If identifier is a string (name), hash it to get consistent index
  if (typeof userIdentifier === 'string') {
    let hash = 0;
    for (let i = 0; i < userIdentifier.length; i++) {
      const char = userIdentifier.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % 100; // Max 100 unique colors

    if (!colorCache[userIdentifier]) {
      colorCache[userIdentifier] = generateUserColor(index);
    }
    return colorCache[userIdentifier];
  }

  // Fallback
  return generateUserColor(0);
}

/**
 * Clear color cache (useful for testing or reset)
 */
export function clearColorCache() {
  Object.keys(colorCache).forEach(key => delete colorCache[key]);
}

/**
 * Get a CSS class friendly color identifier
 */
export function getColorClass(userIdentifier) {
  if (typeof userIdentifier === 'string') {
    return `color-${userIdentifier.replace(/\s+/g, '-').toLowerCase()}`;
  }
  return `color-${userIdentifier}`;
}

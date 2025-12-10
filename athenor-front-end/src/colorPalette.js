/**
 * Color Palette Generator
 * Generates 100+ unique, accessible colors that work in both light and dark modes
 */

// High contrast color palette - HSL format for easy manipulation
// These colors have been selected to be distinguishable and work in both light/dark modes
export const BASE_COLORS = [
  { h: 0, s: 85, l: 50 },     // Red
  { h: 30, s: 85, l: 50 },    // Orange
  { h: 45, s: 85, l: 50 },    // Gold
  { h: 60, s: 85, l: 50 },    // Yellow
  { h: 90, s: 85, l: 50 },    // Lime
  { h: 120, s: 85, l: 50 },   // Green
  { h: 150, s: 85, l: 50 },   // Mint
  { h: 180, s: 85, l: 50 },   // Cyan
  { h: 210, s: 85, l: 50 },   // Sky
  { h: 240, s: 85, l: 50 },   // Blue
  { h: 270, s: 85, l: 50 },   // Purple
  { h: 300, s: 85, l: 50 },   // Magenta
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
 * Returns both light mode and dark mode variations
 */
export function generateUserColor(userIndex) {
  // Cycle through base colors and vary saturation/lightness for more variety
  const baseColorIndex = userIndex % BASE_COLORS.length;
  const variation = Math.floor(userIndex / BASE_COLORS.length);

  const baseColor = BASE_COLORS[baseColorIndex];

  // Adjust saturation and lightness based on variation to create unique colors
  const saturation = Math.max(60, 85 - variation * 5);
  const lightnessLight = 50 + (variation % 3) * 5; // Vary lightness for light mode
  const lightnessDark = 70 + (variation % 3) * 5;  // Brighter for better dark mode readability

  return {
    name: `Color-${userIndex}`,
    light: hslToHex(baseColor.h, saturation, lightnessLight),
    dark: hslToHex(baseColor.h, saturation, lightnessDark),
    hue: baseColor.h,
    saturation,
    lightnessLight,
    lightnessDark,
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

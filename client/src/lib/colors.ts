// Helper to calculate complementary color
export function getComplementaryColor(hex: string): string {
  if (!hex || !hex.startsWith('#')) return hex; // Fallback

  // Remove hash if present
  hex = hex.replace('#', '');
  
  // Parse r, g, b
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate complementary
  // Simple inversion: 255 - value
  const compR = 255 - r;
  const compG = 255 - g;
  const compB = 255 - b;
  
  // Convert back to hex
  const toHex = (n: number) => {
    const h = n.toString(16);
    return h.length === 1 ? '0' + h : h;
  };
  
  return `#${toHex(compR)}${toHex(compG)}${toHex(compB)}`;
}

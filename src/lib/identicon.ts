/**
 * Deterministic avatar generation from wallet address.
 * Creates a unique, visually distinct avatar without revealing the wallet address.
 */

// Simple hash function for consistent coloring
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Generate HSL color from hash
const hashToHsl = (hash: number, saturation: number, lightness: number): string => {
  const hue = hash % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Generate a data URL for a deterministic identicon based on address.
 * Uses a simple geometric pattern that's unique per address.
 */
export const generateIdenticon = (address: string, size: number = 128): string => {
  const hash = hashCode(address.toLowerCase());
  
  // Generate colors from hash
  const primaryColor = hashToHsl(hash, 70, 55);
  const secondaryColor = hashToHsl(hash + 120, 65, 45);
  const bgColor = hashToHsl(hash + 240, 25, 92);
  
  // Create 5x5 grid pattern (mirrored for symmetry)
  const gridSize = 5;
  const cellSize = size / gridSize;
  const cells: string[] = [];
  
  // Use hash to determine which cells are filled
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < Math.ceil(gridSize / 2); col++) {
      const idx = row * gridSize + col;
      const filled = ((hash >> (idx % 16)) & 1) === 1;
      
      if (filled) {
        const x = col * cellSize;
        const mirrorX = (gridSize - 1 - col) * cellSize;
        const y = row * cellSize;
        const color = (row + col) % 2 === 0 ? primaryColor : secondaryColor;
        
        // Add cell and its mirror
        cells.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`);
        if (col < Math.floor(gridSize / 2)) {
          cells.push(`<rect x="${mirrorX}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`);
        }
      }
    }
  }
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${bgColor}"/>
      ${cells.join('')}
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate a Blockie-style identicon URL using a third-party service.
 * Fallback option if SVG generation isn't suitable.
 */
export const getBlockieUrl = (address: string, size: number = 128): string => {
  // Use effigy.im which generates deterministic avatars from Ethereum addresses
  // This service is privacy-preserving as it only uses the public address
  return `https://effigy.im/a/${address}.svg`;
};

/**
 * Get the best available avatar for a user.
 * Priority: ENS avatar > Generated identicon
 */
export const getAvatarUrl = (
  ensAvatar: string | null,
  walletAddress: string | undefined
): string => {
  if (ensAvatar) {
    return ensAvatar;
  }
  
  if (walletAddress) {
    return generateIdenticon(walletAddress);
  }
  
  // Ultimate fallback - generic avatar
  return generateIdenticon('0x0000000000000000000000000000000000000000');
};

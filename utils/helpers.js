/**
 * Format number with k notation for large values
 * Numbers above 8192 are displayed as "16k", "32k", etc.
 */
export const formatNumber = (value) => {
  const num = parseInt(value, 10);
  
  if (num > 8192) {
    const kValue = Math.floor(num / 1000);
    return `${kValue}k`;
  }
  
  return num.toLocaleString();
};

/**
 * Format planet value - shows full number for solar system preview
 * This is specifically for the value column in the preview page
 */
export const formatPlanetValue = (value) => {
  // Handle infinity case
  if (value === '∞' || value === Infinity) {
    return '∞';
  }
  
  const num = parseInt(value, 10);
  
  // Check if it's a valid number
  if (isNaN(num)) {
    return '∞';
  }
  
  // Return the full value as a string for the preview
  return num.toString();
};

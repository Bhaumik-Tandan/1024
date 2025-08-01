const fs = require('fs');
const path = require('path');

// Create canvas-based PNG generation for space assets
function createSpaceBackground(width, height) {
  // Create a simple space background pattern using RGB values
  const canvas = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="space" cx="50%" cy="50%" r="100%">
          <stop offset="0%" style="stop-color:#16213e"/>
          <stop offset="40%" style="stop-color:#1a0a2e"/>
          <stop offset="100%" style="stop-color:#0a0a1a"/>
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#space)"/>
    </svg>
  `;
  return canvas;
}

function createSplashScreen() {
  return `
<svg width="1242" height="2688" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="spaceBackground" cx="50%" cy="50%" r="100%">
      <stop offset="0%" style="stop-color:#16213e"/>
      <stop offset="40%" style="stop-color:#1a0a2e"/>
      <stop offset="100%" style="stop-color:#0a0a1a"/>
    </radialGradient>
    <radialGradient id="earth" cx="30%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:#87CEEB"/>
      <stop offset="30%" style="stop-color:#4169E1"/>
      <stop offset="60%" style="stop-color:#228B22"/>
      <stop offset="100%" style="stop-color:#006400"/>
    </radialGradient>
    <radialGradient id="mars" cx="40%" cy="40%" r="60%">
      <stop offset="0%" style="stop-color:#FF6B35"/>
      <stop offset="50%" style="stop-color:#CD5C5C"/>
      <stop offset="100%" style="stop-color:#8B0000"/>
    </radialGradient>
    <radialGradient id="venus" cx="35%" cy="35%" r="65%">
      <stop offset="0%" style="stop-color:#FFD700"/>
      <stop offset="50%" style="stop-color:#FFA500"/>
      <stop offset="100%" style="stop-color:#FF8C00"/>
    </radialGradient>
  </defs>
  
  <rect width="1242" height="2688" fill="url(#spaceBackground)"/>
  
  <!-- Stars -->
  <circle cx="100" cy="300" r="2" fill="#FFFFFF" opacity="0.8"/>
  <circle cx="300" cy="150" r="1.5" fill="#F0F8FF" opacity="0.7"/>
  <circle cx="500" cy="250" r="1" fill="#FFFACD" opacity="0.6"/>
  <circle cx="700" cy="180" r="2.5" fill="#FFFFFF" opacity="0.9"/>
  <circle cx="900" cy="320" r="1" fill="#E6E6FA" opacity="0.5"/>
  <circle cx="1100" cy="200" r="1.5" fill="#FFFFFF" opacity="0.8"/>
  <circle cx="150" cy="500" r="1" fill="#F0F8FF" opacity="0.6"/>
  <circle cx="850" cy="450" r="2" fill="#FFFFFF" opacity="0.7"/>
  <circle cx="1050" cy="550" r="1.5" fill="#FFFACD" opacity="0.8"/>
  
  <!-- More stars -->
  <circle cx="250" cy="800" r="1" fill="#FFFFFF" opacity="0.6"/>
  <circle cx="450" cy="750" r="1.5" fill="#F0F8FF" opacity="0.7"/>
  <circle cx="650" cy="850" r="1" fill="#E6E6FA" opacity="0.5"/>
  <circle cx="950" cy="780" r="2" fill="#FFFFFF" opacity="0.8"/>
  <circle cx="1150" cy="820" r="1" fill="#FFFACD" opacity="0.6"/>
  
  <!-- Stars around bottom -->
  <circle cx="200" cy="2100" r="1.5" fill="#FFFFFF" opacity="0.7"/>
  <circle cx="400" cy="2200" r="1" fill="#F0F8FF" opacity="0.6"/>
  <circle cx="600" cy="2150" r="2" fill="#FFFFFF" opacity="0.8"/>
  <circle cx="800" cy="2250" r="1" fill="#E6E6FA" opacity="0.5"/>
  <circle cx="1000" cy="2180" r="1.5" fill="#FFFACD" opacity="0.7"/>
  
  <!-- Central planets -->
  <circle cx="300" cy="1000" r="45" fill="url(#mars)" opacity="0.9"/>
  <circle cx="550" cy="1100" r="60" fill="url(#earth)" opacity="0.95"/>
  <circle cx="800" cy="950" r="35" fill="url(#venus)" opacity="0.85"/>
  
  <!-- Title -->
  <text x="621" y="1400" text-anchor="middle" font-family="Arial, sans-serif" font-size="120" font-weight="900" fill="#FFFFFF">SPACE</text>
  <text x="621" y="1550" text-anchor="middle" font-family="Arial, sans-serif" font-size="120" font-weight="900" fill="#4A90E2">DROP</text>
  <text x="621" y="1650" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="300" fill="#B0C4DE">Explore the Universe</text>
</svg>
  `;
}

function createIcon() {
  return `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="spaceBackground" cx="50%" cy="50%" r="70%">
      <stop offset="0%" style="stop-color:#1a0a2e"/>
      <stop offset="70%" style="stop-color:#16213e"/>
      <stop offset="100%" style="stop-color:#0a0a1a"/>
    </radialGradient>
    <radialGradient id="earth" cx="35%" cy="35%" r="65%">
      <stop offset="0%" style="stop-color:#87CEEB"/>
      <stop offset="30%" style="stop-color:#4169E1"/>
      <stop offset="60%" style="stop-color:#228B22"/>
      <stop offset="100%" style="stop-color:#006400"/>
    </radialGradient>
    <radialGradient id="mars" cx="40%" cy="40%" r="60%">
      <stop offset="0%" style="stop-color:#FF6B35"/>
      <stop offset="50%" style="stop-color:#CD5C5C"/>
      <stop offset="100%" style="stop-color:#8B0000"/>
    </radialGradient>
    <radialGradient id="venus" cx="35%" cy="35%" r="65%">
      <stop offset="0%" style="stop-color:#FFD700"/>
      <stop offset="50%" style="stop-color:#FFA500"/>
      <stop offset="100%" style="stop-color:#FF8C00"/>
    </radialGradient>
    <radialGradient id="moon" cx="40%" cy="40%" r="60%">
      <stop offset="0%" style="stop-color:#F5F5DC"/>
      <stop offset="50%" style="stop-color:#C0C0C0"/>
      <stop offset="100%" style="stop-color:#808080"/>
    </radialGradient>
  </defs>
  
  <rect width="1024" height="1024" fill="url(#spaceBackground)" rx="200"/>
  
  <!-- Background stars -->
  <circle cx="150" cy="200" r="3" fill="#FFFFFF" opacity="0.6"/>
  <circle cx="300" cy="150" r="2" fill="#F0F8FF" opacity="0.5"/>
  <circle cx="500" cy="180" r="2.5" fill="#FFFACD" opacity="0.7"/>
  <circle cx="700" cy="130" r="2" fill="#FFFFFF" opacity="0.6"/>
  <circle cx="850" cy="220" r="1.5" fill="#E6E6FA" opacity="0.5"/>
  <circle cx="900" cy="100" r="3" fill="#FFFFFF" opacity="0.8"/>
  
  <!-- More background stars -->
  <circle cx="100" cy="400" r="1.5" fill="#FFFFFF" opacity="0.4"/>
  <circle cx="200" cy="450" r="1" fill="#F0F8FF" opacity="0.5"/>
  <circle cx="900" cy="400" r="2" fill="#FFFACD" opacity="0.6"/>
  <circle cx="950" cy="350" r="1.5" fill="#FFFFFF" opacity="0.5"/>
  
  <circle cx="180" cy="700" r="2" fill="#FFFFFF" opacity="0.6"/>
  <circle cx="350" cy="750" r="1.5" fill="#E6E6FA" opacity="0.5"/>
  <circle cx="700" cy="800" r="2.5" fill="#FFFFFF" opacity="0.7"/>
  <circle cx="850" cy="720" r="1" fill="#F0F8FF" opacity="0.4"/>
  
  <circle cx="120" cy="900" r="1.5" fill="#FFFACD" opacity="0.6"/>
  <circle cx="400" cy="920" r="2" fill="#FFFFFF" opacity="0.5"/>
  <circle cx="800" cy="950" r="1.5" fill="#E6E6FA" opacity="0.5"/>
  <circle cx="950" cy="900" r="2" fill="#FFFFFF" opacity="0.6"/>
  
  <!-- Central planets -->
  <circle cx="512" cy="650" r="120" fill="url(#earth)"/>
  <circle cx="350" cy="450" r="70" fill="url(#mars)"/>
  <circle cx="680" cy="420" r="75" fill="url(#venus)"/>
  <circle cx="500" cy="280" r="45" fill="url(#moon)"/>
  
  <!-- Cosmic accents -->
  <circle cx="200" cy="300" r="8" fill="#00BFFF" opacity="0.7"/>
  <circle cx="800" cy="250" r="6" fill="#9B59B6" opacity="0.6"/>
  <circle cx="150" cy="600" r="5" fill="#1ABC9C" opacity="0.5"/>
  <circle cx="880" cy="600" r="7" fill="#FFD700" opacity="0.6"/>
</svg>
  `;
}

// Generate the SVG files first
console.log('Generating space-themed assets...');

// Write SVG files
fs.writeFileSync('./assets/splash-space.svg', createSplashScreen());
fs.writeFileSync('./assets/icon-space.svg', createIcon());

console.log('Space-themed SVG assets generated successfully!');
console.log('');
console.log('To convert to PNG, you can:');
console.log('1. Use online SVG to PNG converters');
console.log('2. Open in browsers and save as PNG');
console.log('3. Use design tools like Figma, Sketch, or Photoshop');
console.log('');
console.log('Required sizes:');
console.log('- splash.png: 1242x2688');
console.log('- icon.png: 1024x1024');
console.log('- adaptive-icon.png: 1024x1024'); 
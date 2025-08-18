const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  // Converting splash-space.svg to PNG files
  
  const svgPath = path.join(__dirname, '../assets/sources/splash-space.svg');
  const splashDir = path.join(__dirname, '../assets/splash/');
  
  // Check if SVG file exists
  if (!fs.existsSync(svgPath)) {
    // Error: splash-space.svg not found!
    return;
  }
  
  // Ensure splash directory exists
  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
  }
  
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Convert to different sizes
    // Standard splash screen (1242x2688)
    await sharp(svgBuffer)
      .resize(1242, 2688)
      .png()
      .toFile(path.join(splashDir, 'splash.png'));
    
    // Generated splash.png (1242x2688)
    
    // Android splash screen (same as standard for now)
    await sharp(svgBuffer)
      .resize(1242, 2688)
      .png()
      .toFile(path.join(splashDir, 'splash-android.png'));
    
    // Generated splash-android.png (1242x2688)
    
    // Splash screen PNG files generated successfully!
    // The new space-themed splash screen will now show when your app loads.
    
  } catch (error) {
    // Error converting SVG to PNG
  }
}

convertSvgToPng(); 
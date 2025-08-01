const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  console.log('Converting splash-space.svg to PNG files...');
  
  const svgPath = path.join(__dirname, '../assets/sources/splash-space.svg');
  const splashDir = path.join(__dirname, '../assets/splash/');
  
  // Check if SVG file exists
  if (!fs.existsSync(svgPath)) {
    console.error('Error: splash-space.svg not found!');
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
    
    console.log('✅ Generated splash.png (1242x2688)');
    
    // Android splash screen (same as standard for now)
    await sharp(svgBuffer)
      .resize(1242, 2688)
      .png()
      .toFile(path.join(splashDir, 'splash-android.png'));
    
    console.log('✅ Generated splash-android.png (1242x2688)');
    
    console.log('\n🚀 Splash screen PNG files generated successfully!');
    console.log('The new space-themed splash screen will now show when your app loads.');
    
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

convertSvgToPng(); 
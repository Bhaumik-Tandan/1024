# 🎨 Assets Folder Organization

This folder contains all the assets for the Space Drop game, organized into logical subfolders for better maintainability.

## 📁 Folder Structure

### `/icons/` - App Icons
- `icon.png` - Main app icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon foreground

### `/splash/` - Splash Screens  
- `splash.png` - iOS splash screen
- `splash-android.png` - Android splash screen

### `/audio/` - Sound Effects
- `mergeSound.wav` - Sound when tiles merge completely
- `intermediateMerge.wav` - Sound for intermediate merges
- `drop.wav` - Sound when tiles drop/land

### `/sources/` - Generated SVG Sources
- `icon-space.svg` - Generated icon source (space theme)
- `splash-space.svg` - Generated splash source (space theme)

## 🔧 Usage

### In App Configuration (`app.json`)
All icons and splash screens are referenced with their organized paths:
```json
"icon": "./assets/icons/icon.png"
"splash": { "image": "./assets/splash/splash.png" }
```

### In Sound Manager (`utils/soundManager.js`)
Audio files are loaded from the audio subfolder:
```js
require('../assets/audio/mergeSound.wav')
```

### In Build Scripts (`scripts/`)
SVG sources are generated in the sources subfolder and referenced accordingly.

## 🧹 Maintenance

- Unused legacy SVG files have been removed
- All file references have been updated to use the new structure
- Scripts automatically generate files in the correct locations

This organization improves:
- **Maintainability** - Easy to find specific asset types
- **Build Performance** - Clear separation of source vs. built assets  
- **Team Collaboration** - Obvious folder structure for new developers 
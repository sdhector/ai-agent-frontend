#!/usr/bin/env node

/**
 * Generate PWA icons using Canvas
 * Creates 192x192 and 512x512 PNG icons
 */

const fs = require('fs');
const path = require('path');

// Simple PNG generator without external dependencies
// Creates a colored square with text
function generateSimplePNG(size, outputPath) {
  console.log(`Generating ${size}x${size} icon...`);

  // For now, create an SVG and save instructions
  // In production, you'd want to use proper image generation
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0284c7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0369a1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#gradient)" rx="${size * 0.15}" />
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">AI</text>
</svg>`;

  // Save as SVG for now (browsers support SVG in manifest)
  const svgPath = outputPath.replace('.png', '.svg');
  fs.writeFileSync(svgPath, svg);
  console.log(`Created SVG: ${svgPath}`);

  // Create a note about PNG conversion
  return svgPath;
}

// Generate icons
const publicDir = path.join(__dirname, '..', 'public');
const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure directories exist
[publicDir, assetsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate PWA icons in public/
generateSimplePNG(192, path.join(publicDir, 'icon-192.png'));
generateSimplePNG(512, path.join(publicDir, 'icon-512.png'));

// Generate Expo icons in assets/
generateSimplePNG(1024, path.join(assetsDir, 'icon.png'));
generateSimplePNG(1024, path.join(assetsDir, 'adaptive-icon.png'));

// Create splash screen
const splashSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1242" height="2688" viewBox="0 0 1242 2688" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0284c7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0369a1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1242" height="2688" fill="url(#gradient)" />
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">AI Agent</text>
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSvg);

console.log('\n✅ Icon generation complete!');
console.log('\nNote: SVG icons created. For production, convert to PNG using:');
console.log('  - Online: https://cloudconvert.com/svg-to-png');
console.log('  - CLI: npm install -g sharp-cli && sharp -i icon.svg -o icon.png');
console.log('  - Or use any image editor to export as PNG\n');

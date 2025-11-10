#!/usr/bin/env node

/**
 * Convert SVG icons to PNG using Sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng(svgPath, pngPath, size) {
  try {
    console.log(`Converting ${path.basename(svgPath)} to PNG (${size}x${size})...`);

    const svgBuffer = fs.readFileSync(svgPath);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(pngPath);

    console.log(`✅ Created: ${pngPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error converting ${svgPath}:`, error.message);
    return false;
  }
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  const assetsDir = path.join(__dirname, '..', 'assets');

  console.log('Converting PWA icons...\n');

  // Convert PWA icons
  await convertSvgToPng(
    path.join(publicDir, 'icon-192.svg'),
    path.join(publicDir, 'icon-192.png'),
    192
  );

  await convertSvgToPng(
    path.join(publicDir, 'icon-512.svg'),
    path.join(publicDir, 'icon-512.png'),
    512
  );

  // Convert Expo assets
  await convertSvgToPng(
    path.join(assetsDir, 'icon.svg'),
    path.join(assetsDir, 'icon.png'),
    1024
  );

  await convertSvgToPng(
    path.join(assetsDir, 'adaptive-icon.svg'),
    path.join(assetsDir, 'adaptive-icon.png'),
    1024
  );

  await convertSvgToPng(
    path.join(assetsDir, 'splash.svg'),
    path.join(assetsDir, 'splash.png'),
    1242
  );

  console.log('\n✅ All icons converted successfully!');
}

main().catch(console.error);

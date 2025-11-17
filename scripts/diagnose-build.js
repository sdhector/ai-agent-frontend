#!/usr/bin/env node
/**
 * Diagnostic script to check build output and identify issues
 * Run after building: npm run build:web
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');

console.log('🔍 Build Diagnostic Tool');
console.log('========================\n');

// Check if dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ ERROR: dist/ directory not found!');
  console.error('   Run "npm run build:web" first.\n');
  process.exit(1);
}

console.log('✅ dist/ directory exists\n');

// List all files in dist
console.log('📁 Files in dist/:\n');
const files = [];
function walkDir(dir, baseDir = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(baseDir, entry.name);
    
    if (entry.isDirectory()) {
      walkDir(fullPath, relativePath);
    } else {
      const stats = fs.statSync(fullPath);
      files.push({
        path: relativePath,
        size: stats.size,
        fullPath
      });
    }
  });
}

walkDir(DIST_DIR);

files.forEach(file => {
  const sizeKB = (file.size / 1024).toFixed(2);
  console.log(`   ${file.path.padEnd(50)} ${sizeKB} KB`);
});

console.log(`\n   Total files: ${files.length}\n`);

// Check critical files
console.log('🔍 Checking critical files:\n');

const criticalFiles = {
  'index.html': 'Main HTML file',
  '_sitemap.html': 'Sitemap (Expo Router)',
  'index.js': 'Main JavaScript bundle',
  'index.css': 'Main CSS file',
};

let allCriticalFilesFound = true;

Object.keys(criticalFiles).forEach(file => {
  const filePath = path.join(DIST_DIR, file);
  const exists = fs.existsSync(filePath);
  const icon = exists ? '✅' : '❌';
  console.log(`   ${icon} ${file.padEnd(25)} ${criticalFiles[file]}`);
  
  if (!exists) {
    allCriticalFilesFound = false;
    
    // Check for variations
    const variations = [
      file.replace('.html', '.htm'),
      file.replace('index', 'main'),
      path.join('_expo', 'static', file),
    ];
    
    variations.forEach(variation => {
      const varPath = path.join(DIST_DIR, variation);
      if (fs.existsSync(varPath)) {
        console.log(`      ⚠️  Found similar file: ${variation}`);
      }
    });
  }
});

console.log('');

// Check for Expo Router structure
console.log('🔍 Checking Expo Router structure:\n');

const expoRouterFiles = [
  '_sitemap.html',
  '_expo/static/js/web/',
  '_expo/static/css/',
];

let expoRouterStructure = false;
expoRouterFiles.forEach(file => {
  const filePath = path.join(DIST_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ Found: ${file}`);
    expoRouterStructure = true;
  } else {
    console.log(`   ⚠️  Missing: ${file}`);
  }
});

console.log('');

// Check index.html content
console.log('🔍 Analyzing index.html:\n');

const indexHtmlPath = path.join(DIST_DIR, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Check for script tags
  const scriptTags = htmlContent.match(/<script[^>]*>/g) || [];
  console.log(`   📜 Script tags found: ${scriptTags.length}`);
  scriptTags.forEach((tag, i) => {
    const srcMatch = tag.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      const scriptPath = srcMatch[1];
      const fullScriptPath = path.join(DIST_DIR, scriptPath);
      const exists = fs.existsSync(fullScriptPath);
      console.log(`      ${exists ? '✅' : '❌'} ${scriptPath}`);
    } else {
      console.log(`      ⚠️  Inline script ${i + 1}`);
    }
  });
  
  // Check for CSS links
  const cssTags = htmlContent.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/g) || [];
  console.log(`\n   🎨 Stylesheet links found: ${cssTags.length}`);
  cssTags.forEach((tag, i) => {
    const hrefMatch = tag.match(/href=["']([^"']+)["']/);
    if (hrefMatch) {
      const cssPath = hrefMatch[1];
      const fullCssPath = path.join(DIST_DIR, cssPath);
      const exists = fs.existsSync(fullCssPath);
      console.log(`      ${exists ? '✅' : '❌'} ${cssPath}`);
    }
  });
  
  // Check for root div
  const hasRootDiv = htmlContent.includes('<div id="root"') || htmlContent.includes('<div id="__root"');
  console.log(`\n   ${hasRootDiv ? '✅' : '❌'} Root div found: ${hasRootDiv}`);
  
  // Check for environment variables
  const hasApiUrl = htmlContent.includes('EXPO_PUBLIC_API_URL') || 
                    htmlContent.includes('http://localhost') ||
                    htmlContent.includes('https://');
  console.log(`   ${hasApiUrl ? '⚠️' : '❌'} API URL references: ${hasApiUrl ? 'Found (check if production URL)' : 'Not found'}`);
  
} else {
  console.log('   ❌ index.html not found!');
}

console.log('');

// Check asset paths
console.log('🔍 Checking asset paths in index.html:\n');

if (fs.existsSync(indexHtmlPath)) {
  const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Find all asset references
  const assetPatterns = [
    /src=["']([^"']+)["']/g,
    /href=["']([^"']+)["']/g,
  ];
  
  const assets = new Set();
  assetPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(htmlContent)) !== null) {
      const assetPath = match[1];
      // Skip data URIs and external URLs
      if (!assetPath.startsWith('data:') && !assetPath.startsWith('http')) {
        assets.add(assetPath);
      }
    }
  });
  
  console.log(`   Found ${assets.size} asset references`);
  
  let allAssetsExist = true;
  assets.forEach(asset => {
    // Handle absolute paths (starting with /)
    const assetPath = asset.startsWith('/') 
      ? path.join(DIST_DIR, asset.substring(1))
      : path.join(DIST_DIR, asset);
    
    const exists = fs.existsSync(assetPath);
    if (!exists) {
      console.log(`      ❌ Missing: ${asset}`);
      allAssetsExist = false;
    }
  });
  
  if (allAssetsExist) {
    console.log(`   ✅ All referenced assets exist`);
  }
}

console.log('');

// Summary
console.log('📊 Summary:\n');

if (!allCriticalFilesFound) {
  console.log('❌ CRITICAL: Missing critical files!');
  console.log('   This build may not work correctly.\n');
}

if (!expoRouterStructure) {
  console.log('⚠️  WARNING: Expo Router structure not detected.');
  console.log('   This might indicate an export issue.\n');
}

console.log('💡 Next steps:');
console.log('   1. Review the missing files above');
console.log('   2. Check Firebase Hosting logs');
console.log('   3. Test locally: npm run preview:web');
console.log('   4. Check browser console for errors\n');


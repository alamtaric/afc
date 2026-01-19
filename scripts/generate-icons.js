const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// アイコンのSVGを生成
function generateSvgIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5"/>
      <stop offset="100%" style="stop-color:#7C3AED"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
  <text x="50%" y="58%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">🏠</text>
</svg>`;
}

async function generateIcons() {
  // iconsディレクトリを作成
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [192, 512];

  for (const size of sizes) {
    const svg = generateSvgIcon(size);
    const pngPath = path.join(iconsDir, `icon-${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(pngPath);

    console.log(`Created: icon-${size}.png`);
  }

  console.log('\\nPNGアイコンの生成が完了しました！');
}

generateIcons().catch(console.error);

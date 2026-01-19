const fs = require('fs');
const path = require('path');

// SVGアイコンを生成
function generateSvgIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5"/>
      <stop offset="100%" style="stop-color:#7C3AED"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
  <text x="50%" y="55%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="middle">🏠</text>
</svg>`;
}

// iconsディレクトリを作成
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVGアイコンを保存
const sizes = [192, 512];
sizes.forEach(size => {
  const svg = generateSvgIcon(size);
  const filePath = path.join(iconsDir, `icon-${size}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`Created: ${filePath}`);
});

console.log('\\nSVGアイコンを作成しました。');
console.log('PNGが必要な場合は、以下のオンラインツールで変換できます:');
console.log('https://svgtopng.com/');

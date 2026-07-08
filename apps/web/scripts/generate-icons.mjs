// One-off PWA icon generation from public/icons/pwa/icon.svg.
// Run: npm run generate:icons -w apps/web  (outputs are committed).
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const iconDir = path.join(root, '..', 'public', 'icons', 'pwa');
const publicDir = path.join(root, '..', 'public');
const svg = await readFile(path.join(iconDir, 'icon.svg'));

// Plain icons: SVG rendered edge-to-edge.
for (const size of [192, 512]) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(path.join(iconDir, `icon-${size}.png`));
}

// Maskable icons: artwork scaled to the 80% safe zone on a solid tile so
// launcher masks (circle, squircle) never clip the glyph.
for (const size of [192, 512]) {
  const inner = Math.round(size * 0.8);
  const art = await sharp(svg).resize(inner, inner).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: '#ff80ab' },
  })
    .composite([{ input: art, gravity: 'center' }])
    .png()
    .toFile(path.join(iconDir, `icon-maskable-${size}.png`));
}

// iOS home-screen icon (iOS applies its own rounding; solid background required).
const appleArt = await sharp(svg).resize(180, 180).png().toBuffer();
await sharp({
  create: { width: 180, height: 180, channels: 4, background: '#fef6f9' },
})
  .composite([{ input: appleArt, gravity: 'center' }])
  .png()
  .toFile(path.join(publicDir, 'apple-touch-icon.png'));

console.log('Generated PWA icons in', iconDir);

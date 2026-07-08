import type { MetadataRoute } from 'next';

// Manifest colors can't reference CSS variables — these are the Soft Arcade
// arcade-light tokens from globals.css (--bg-canvas, --pink-300), duplicated
// here as the one sanctioned hex exception.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SkillSum — Mental Math Mastery',
    short_name: 'SkillSum',
    description: 'Learn mental math tricks through 400 levels of play.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fef6f9',
    theme_color: '#fef6f9',
    icons: [
      { src: '/icons/pwa/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/pwa/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/pwa/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/pwa/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

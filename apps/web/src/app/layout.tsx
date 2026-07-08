import type { Metadata, Viewport } from 'next';
import { DM_Sans, JetBrains_Mono, Nunito } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './globals.css';

// Runs before first paint to set data-theme on <html>, avoiding a flash of the wrong theme.
// Reads the same `skillsum-theme` cookie the ThemeProvider writes; resolves 'system' via matchMedia.
// Accepts any theme id from @skillsum/shared THEMES; legacy 'light'/'dark' map to arcade-light/arcade-dark.
const themeInitScript = `(function(){try{var KNOWN={'system':1,'arcade-light':1,'arcade-dark':1,'serika':1,'serika-dark':1,'nord':1,'gruvbox-dark':1,'dracula':1,'botanical':1,'mush':1,'ocean':1,'rose-dark':1,'cream':1,'mint':1,'sky':1,'lavender':1,'cobalt':1,'matrix':1,'sunset-dark':1,'cosmic':1};var m=document.cookie.match(/(?:^|;\\s*)skillsum-theme=([^;]+)/);var raw=m?decodeURIComponent(m[1]):'system';var t=(raw==='light'?'arcade-light':raw==='dark'?'arcade-dark':(KNOWN[raw]?raw:'system'));var resolved=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'arcade-dark':'arcade-light'):t;document.documentElement.dataset.theme=resolved;}catch(e){}})();`;

const nunito = Nunito({ subsets: ['latin'], weight: ['700', '800', '900'], variable: '--font-display' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['700'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'SkillSum — Mental Math Mastery',
  description: 'Learn mental math tricks through 400 levels of play.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${dmSans.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

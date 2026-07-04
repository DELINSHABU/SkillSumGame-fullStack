import type { Metadata, Viewport } from 'next';
import { DM_Sans, JetBrains_Mono, Nunito } from 'next/font/google';
import './globals.css';

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
    <html lang="en" className={`${nunito.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}

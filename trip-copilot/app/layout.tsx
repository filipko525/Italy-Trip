import type { Metadata, Viewport } from 'next';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { AppStateProvider } from '@/lib/storage/app-state';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

/*
  Písmo: Barlow a Barlow Condensed.
  Barlow vychádza z dopravného a vozidlového písma – čo je presne svet,
  v ktorom sa appka používa. Condensed rez nesie kilometre, štítky a čísla,
  bežný rez texty.
*/
const barlow = Barlow({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Trip Copilot – Lignano 2026',
  description: 'Dovolenkový navigátor a road-trip copilot na cestu z Trnavy do Lignano Sabbiadoro.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Trip Copilot',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF5EC' },
    { media: '(prefers-color-scheme: dark)', color: '#08161C' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <body className={`${barlow.variable} ${barlowCondensed.variable} font-sans`}>
        <AppStateProvider>
          <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-nav">
            {children}
          </div>
          <BottomNav />
          <ServiceWorkerRegister />
        </AppStateProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next'
import { Roboto, Orbitron, Roboto_Mono } from 'next/font/google'
import BfcacheGuard from '@/components/BfcacheGuard'
import './globals.css'

const roboto = Roboto({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
})

const orbitron = Orbitron({
  weight: ['700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orbitron',
})

const robotoMono = Roboto_Mono({
  weight: ['600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export const metadata: Metadata = {
  title: 'Grind — Interval Timer',
  description: 'Customizable interval timer for workouts, focus, and more. Build custom intervals, share with friends, and stay on track.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/Icon-192.png',
  },
  openGraph: {
    title: 'Grind — Interval Timer',
    description: 'Customizable interval timer for workouts, focus, and more.',
    url: 'https://grind-timer.fit',
    siteName: 'Grind',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grind — Interval Timer',
    description: 'Customizable interval timer for workouts, focus, and more.',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d1117' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${orbitron.variable} ${robotoMono.variable}`} style={{ fontFamily: 'var(--font-roboto), sans-serif' }}>
      <body style={{ fontFamily: 'var(--font-roboto), sans-serif', margin: 0, padding: 0, background: '#0d1117', minHeight: '100vh' }}>
        <BfcacheGuard />
        {children}
      </body>
    </html>
  )
}

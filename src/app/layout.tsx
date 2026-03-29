import type { Metadata, Viewport } from 'next'
import { Roboto, Orbitron, Roboto_Mono } from 'next/font/google'
import BfcacheGuard from '@/components/BfcacheGuard'
import './globals.css'

const roboto = Roboto({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

const orbitron = Orbitron({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-orbitron',
})

const robotoMono = Roboto_Mono({
  weight: ['600'],
  subsets: ['latin'],
  variable: '--font-roboto-mono',
})

export const metadata: Metadata = {
  title: 'Grind',
  description: 'Customizable interval timer for workouts, focus, and more',
  manifest: './manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d1117' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
  // viewport-fit=cover lets content extend under the notch/home indicator
  // so env(safe-area-inset-*) can be used for padding
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

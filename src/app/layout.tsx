import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';
import { getBaseUrl } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'TapCard | One Card. Your Entire Professional Identity.',
  description:
    'Instant NFC & QR Digital Visiting Cards. Share contact info, WhatsApp, portfolio, and social channels with a single tap. No app required.',
  metadataBase: new URL(getBaseUrl()),
  openGraph: {
    title: 'TapCard | NFC + QR Digital Visiting Card Platform',
    description: 'One Card. Your Entire Professional Identity. Tap. Connect. Grow.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shiptrack - Live Search with Highlight',
  description: 'Realtime Command Palette Live Search with Accent-insensitive Regex Highlight (MemberFun Challenge #63)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

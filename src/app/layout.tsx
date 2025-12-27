import type { Metadata } from 'next';
import "./global.css"

export const metadata: Metadata = {
  title: 'Flash Sale System',
  description: 'High-performance flash sale platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
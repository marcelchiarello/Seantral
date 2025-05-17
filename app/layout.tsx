import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Seantral - Marine Data Platform',
  description: 'High-resolution, near-real-time information on coastal and open-water conditions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <footer className="py-6 text-center text-sm text-gray-500 border-t">
          <p>
            Generated using EU Copernicus Marine Service information; NOAA NDBC data public domain.
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} Seantral
          </p>
        </footer>
      </body>
    </html>
  );
} 
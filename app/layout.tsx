import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EcoAudit // Instant Carbon Intelligence',
  description: 'Automated Scope 1 & Scope 2 Energy & Fuel Audit Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

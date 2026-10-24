import type { Metadata } from "next";
import { settings } from "@/lib/data";
import "./globals.css";
export async function generateMetadata(): Promise<Metadata> {
  const s = await settings();
  return {
    title: { default: s.display_name, template: `%s · ${s.display_name}` },
    description: s.description,
    icons: s.favicon_url ? { icon: s.favicon_url } : undefined,
  };
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

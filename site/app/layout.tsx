import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ViewLondon UK — Coming Soon",
  description:
    "ViewLondon UK is a new real estate platform launching soon. Discover London properties with a fresh perspective.",
  openGraph: {
    title: "ViewLondon UK — Coming Soon",
    description:
      "ViewLondon UK is a new real estate platform launching soon. Discover London properties with a fresh perspective.",
    url: "https://viewlondonuk.com",
    siteName: "ViewLondon UK",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ViewLondon UK — Coming Soon",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  metadataBase: new URL(
    process.env.DOMAIN
      ? `https://${process.env.DOMAIN}`
      : "https://viewlondonuk.com"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-navy text-brand-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

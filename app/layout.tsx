import { Agentation } from "agentation";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "https://qr-codegenerator-three.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "QR Studio — Client-Side QR Code Generator & Scanner",
  description:
    "A fast, privacy-respecting QR code generator and scanner. Generate, customize, verify, and export vector SVGs and high-res PNGs entirely inside your browser.",
  keywords: [
    "QR code generator",
    "QR scanner",
    "SVG QR code",
    "Wi-Fi QR",
    "vCard QR",
    "UPI QR",
    "client-side QR",
    "neo-brutalist QR",
  ],
  authors: [{ name: "Harsh Kumar Harsh", url: "https://github.com/Harsh031202" }],
  creator: "Harsh Kumar Harsh",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "QR Studio",
    title: "QR Studio — Client-Side QR Code Generator & Scanner",
    description:
      "A fast, privacy-respecting QR code generator and scanner. Generate, customize, verify, and export vector SVGs and high-res PNGs entirely inside your browser.",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "QR Studio — A QR Code Generator & Scanner Suite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Studio — Client-Side QR Code Generator & Scanner",
    description:
      "A fast, privacy-respecting QR code generator and scanner. Generate, customize, verify, and export vector SVGs and high-res PNGs entirely inside your browser.",
    images: ["/og-preview.png"],
    creator: "@thatoneguy3122",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/og-preview.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#090a0c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="image_src" href="/og-preview.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('qr-studio-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'dark' || (!stored && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-foreground antialiased selection:bg-foreground selection:text-canvas">
        {children}
        {process.env.NODE_ENV === "development" && (
          <Agentation />
        )}
      </body>
    </html>
  );
}

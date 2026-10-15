import { Agentation } from "agentation";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
  ],
  authors: [{ name: "QR Studio" }],
  icons: {
    icon: "/favicon.ico",
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

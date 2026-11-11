import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/tvs-v3/Theme";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jet",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      "https://bike-donation.onrender.com",
  ),
  title: "The People's Apache RR 310 — Lock Your Name, Couple Tag, or @Page",
  description:
    "Lock your Solo tag, Bro/Couple Lock, or clickable @Instagram link on a 38 HP TVS Apache RR 310 wrap from ₹10 — plus download your official Story Certificate.",
  keywords: [
    "Apache RR310",
    "RR 310 wrap",
    "couple lock",
    "motorcycle",
    "community wrap",
  ],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "The People's Apache RR 310 — Own a Piece from ₹10",
    description:
      "Lock your name, Couple tag, or clickable @Page on a 38 HP TVS Apache RR 310 + get an instant Story Certificate.",
    type: "website",
    images: ["/bike/track-duo.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#090A0F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider>
          {children}
          <Toaster position="top-center" offset={76} richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}

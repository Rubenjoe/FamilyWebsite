import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Noto_Serif_Malayalam } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MotionProvider from "@/components/MotionProvider";

/* Self-hosted via next/font — no render-blocking external font requests,
   no layout shift, and automatic font-display handling. */
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const malayalam = Noto_Serif_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-malayalam-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "Pulazhiyil Kudumbayogam — Digital Archive",
  description: "The premium historical platform preserving the heritage and genealogy of the Pulazhiyil family.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${playfair.variable} ${jakarta.variable} ${malayalam.variable}`}
    >
      <body className="bg-[#fbf9f4] text-[#2d312e] min-h-screen flex flex-col antialiased selection:bg-[#d4af37]/20 selection:text-[#1b3622]">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>
          <Navbar />
          <main id="main-content" className="flex-grow">
            {children}
          </main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SceneCanvas from "@/components/SceneCanvas";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CardHoverProvider } from "@/components/CardHoverProvider";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: `${site.name} — ${site.tagline}. Spaces shaped by light, material and the way people move through them.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <CardHoverProvider>
          <SceneCanvas />
          <Header />
          <main className="site-main">{children}</main>
          <Footer />
        </CardHoverProvider>
      </body>
    </html>
  );
}

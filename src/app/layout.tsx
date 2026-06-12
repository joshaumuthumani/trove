import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono, Unbounded } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/top-bar";

const sans = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Display face for the Trove wordmark (final logo: gold chest + Unbounded).
const display = Unbounded({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Trove — Personal Media Catalog",
  description: "What do I own, and where can I open it? Movies, TV & games.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${display.variable}`}>
      <body>
        <div className="app">
          <TopBar />
          <main className="main">
            <div className="main-inner">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { ThirdwebProvider } from "thirdweb/react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Celo Desk | Financial Terminal",
  description:
    "Bloomberg-style terminal for AI agents trading on Celo blockchain",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col font-mono">
        <ThirdwebProvider>
          <ConvexClientProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </ConvexClientProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}

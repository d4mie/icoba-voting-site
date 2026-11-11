import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MottoWatermark } from "@/components/MottoWatermark";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ICOBA Voting",
  description: "Vote for ICOBA Positions and Awards",
  icons: {
    icon: "/igbobi-college-emblem.jpg",
    apple: "/igbobi-college-emblem.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="flex min-h-full flex-col">
        <MottoWatermark />
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          {children}
          <footer className="mt-auto px-4 py-5 text-center text-xs text-neutral-600">
            Design and Development by{" "}
            <a
              href="https://damilolaogunnaike.com"
              className="font-semibold text-neutral-900 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ogunnaike Damilola
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
}

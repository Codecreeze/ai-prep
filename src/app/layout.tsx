import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { themeInitScript } from "@/lib/theme";
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
  title: "AI Interview Prep Kit",
  description: "Turn a job description into a personalised interview prep kit.",
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
    <head>
      {/* Runs before paint so the stored theme is applied before React hydrates — avoids a light-then-dark flash. */}
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
    </head>
    <body className="h-full flex flex-col overflow-hidden">
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;

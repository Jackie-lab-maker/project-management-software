import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppShell } from "@/components/shell/AppShell";
import { themeScript } from "@/components/shell/ThemeToggle";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import "./globals.css";

// Fonts are self-hosted rather than pulled through next/font/google: the build
// environment cannot reach fonts.googleapis.com, and self-hosting is the right
// answer for an internal tool behind the corporate network anyway.
const interTight = localFont({
  variable: "--font-inter-tight",
  display: "swap",
  src: [{ path: "../fonts/inter-tight-variable.woff2", weight: "100 900", style: "normal" }],
});

const plexMono = localFont({
  variable: "--font-plex-mono",
  display: "swap",
  src: [
    { path: "../fonts/plexmono-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/plexmono-500-normal.woff2", weight: "500", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Automation Digital Brain",
  description:
    "Operational source of truth for Micron's Automation Department: projects, controlled knowledge, and an AI agent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${interTight.variable} ${plexMono.variable} antialiased`}>
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}

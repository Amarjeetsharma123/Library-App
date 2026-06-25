import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";

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
    default: "Library Management System",
    template: "%s | Library Management System",
  },
  description: "Advanced Library Management System for managing books, members, borrow records, and reservations.",
  keywords: ["Library", "LMS", "Next.js", "Prisma", "PostgreSQL", "Book Management"],
  authors: [{ name: "LMS Admin" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  manifest: "/manifest.json",
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" richColors />
            <PwaInstallPrompt />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

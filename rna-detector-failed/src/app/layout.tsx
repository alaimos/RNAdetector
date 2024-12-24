import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn, getCurrentUserServer } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { CurrentUserProvider } from "@/lib/session";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RNAdetector 2.0",
  description: "RNAdetector 2.0",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUserServer();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
        )}
      >
        <CurrentUserProvider user={currentUser}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <DashboardLayout>{children}</DashboardLayout>
          </ThemeProvider>
        </CurrentUserProvider>
      </body>
    </html>
  );
}

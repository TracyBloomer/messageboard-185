import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Lora, Manrope } from "next/font/google";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Providers } from "@/components/providers";
import { appConfig } from "@/lib/app-config";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-newsreader"
});

export const metadata: Metadata = {
  title: `${appConfig.appName} | Public onchain board`,
  description: appConfig.description
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${lora.variable} font-sans`}>
        <Providers>
          <div className="mx-auto min-h-screen max-w-screen-md px-4 pb-28 pt-5">
            {children}
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

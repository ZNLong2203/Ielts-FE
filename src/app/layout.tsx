import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import toast, { Toaster } from 'react-hot-toast';
import QueryClientProviderWarpper from "@/provider/queryClientProvider";
import ReduxProviderWrapper from "@/provider/reduxProvider";
import PersistProvider from "@/provider/persistProvider";
import { I18nProvider } from "@/context/I18nContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "IELTS",
  description: "Ielts Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
        <QueryClientProviderWarpper>
          <ReduxProviderWrapper>
            <Toaster/>
            <PersistProvider>{children}</PersistProvider>
          </ReduxProviderWrapper>
        </QueryClientProviderWarpper>
        </I18nProvider>
      </body>
    </html>
  );
}

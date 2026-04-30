import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { ClerkProvider } from '@clerk/nextjs';
import {Toaster} from "sonner"
export const metadata: Metadata = {
  title: "AUDD Payflow — Invoice in AUD. Get paid globally.",
  description: "Create invoices, accept payments, and release funds securely with escrow on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);',
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      >
        <ClerkProvider>
          <Providers>
            {children}
            <Toaster position="top-right"/>
          </Providers>
        </ClerkProvider>

      </body>
    </html>
  );
}

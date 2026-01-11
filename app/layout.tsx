import type { Metadata, Viewport } from "next";
import { Geist, Amarante } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ConditionalLayout } from "@/components/conditional-layout";
import { ChatbaseWidget } from "@/components/chatbase-widget";
// import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.APP_URL || "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Support for iPhone notch and dynamic UI
};

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Elio",
  description: "Elevate your day.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const amarante = Amarante({
  variable: "--font-amarante",
  display: "swap",
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${amarante.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster
            position="bottom-center"
            expand={false}
            offset="24px"
            className="!z-[99999]"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast: "w-[calc(100%-2rem)] mx-4 sm:w-full sm:max-w-md sm:mx-0",
                title: "text-sm font-medium",
                description: "text-sm",
              },
            }}
          />
          <ConditionalLayout>{children}</ConditionalLayout>
          <ChatbaseWidget />
        </ThemeProvider>
        {/* <Analytics /> */}

        {/* Chatbase Widget */}
        <Script
          id="chatbase-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.embeddedChatbotConfig = {
                chatbotId: "fNQScYCO-p2DSA8hisks2",
                domain: "www.chatbase.co"
              };
            `,
          }}
        />
        <Script
          src="https://www.chatbase.co/embed.min.js"
          id="fNQScYCO-p2DSA8hisks2"
          data-domain="www.chatbase.co"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

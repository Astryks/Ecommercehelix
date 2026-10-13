import type { Metadata } from "next";
import { Caveat_Brush, Kalam, Nunito } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, organizationLd, websiteLd } from "@/lib/seo";

// Whiteboard style: purple marker headings, handwritten accents, a clean rounded body for long reading.
const body = Nunito({ variable: "--font-body", subsets: ["latin"] });
const marker = Caveat_Brush({ variable: "--font-marker", subsets: ["latin"], weight: "400" });
const hand = Kalam({ variable: "--font-hand-accent", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: { default: "E-commerce Helix: Grow your e-commerce business a little every day", template: "%s · E-commerce Helix" },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  keywords: ["e-commerce growth app", "Shopify growth tool", "DIY e-commerce marketing", "e-commerce coach app", "alternative to hiring an e-commerce agency", "self-serve e-commerce growth software", "e-commerce profit dashboard", "daily growth plan for online stores"],
  alternates: { canonical: "/" },
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_AU", url: "/" },
  twitter: { card: "summary_large_image" },
  verification: { google: "Vq1JkgDh_HtDkARRBnRMbfzvuobGKb7NSdX47U-bTo4" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${marker.variable} ${hand.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <JsonLd data={[organizationLd(), websiteLd()]} />
      </body>
    </html>
  );
}

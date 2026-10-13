import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, organizationLd, websiteLd } from "@/lib/seo";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const serif = Source_Serif_4({ variable: "--font-serif-display", subsets: ["latin"], axes: ["opsz"] });

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
    <html lang="en" className={`${inter.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <JsonLd data={[organizationLd(), websiteLd()]} />
      </body>
    </html>
  );
}

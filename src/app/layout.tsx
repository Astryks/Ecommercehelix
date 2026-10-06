import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const serif = Source_Serif_4({ variable: "--font-serif-display", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: { default: "Ecommerce Helix: Grow your e-commerce business a little every day", template: "%s · Ecommerce Helix" },
  description:
    "Ecommerce Helix audits your store, gives you three high-impact tasks a day, and does the work when you approve. Grow your e-commerce business a little every day.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}

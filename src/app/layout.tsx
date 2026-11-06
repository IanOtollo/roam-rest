import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { FloatingActions } from "@/components/ui/FloatingActions";
import { brand } from "@/lib/property";

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${brand.name} · Curated stays`, template: `%s · ${brand.name}` },
  description: `${brand.tagline} Characterful stays in Nairobi, with more on the way.`,
  openGraph: {
    title: brand.name,
    description: brand.tagline,
    images: ["/images/hall-trusses.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ec",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies the saved (or system) theme before first paint so there is no flash. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");var d=t==="dark";if(d)document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ConvexClientProvider>
          {children}
          <FloatingActions />
        </ConvexClientProvider>
      </body>
    </html>
  );
}

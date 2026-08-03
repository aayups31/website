import type { Metadata, Viewport } from "next";
import "@fontsource-variable/anybody/wdth.css";
import "@fontsource-variable/anybody/wdth-italic.css";
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "./globals.css";
import { siteConfig } from "@/lib/content";
import { GlobalMotionController } from "@/components/motion/global-motion-controller";
import { RouteAtmosphere } from "@/components/motion/route-atmosphere";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aayups31.github.io/website";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.title}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: `${siteConfig.name} Portfolio`,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  keywords: [
    "Aayu Pratap Singh",
    "software engineer",
    "machine learning",
    "University of Waterloo",
    "Next.js",
    "network infrastructure",
    "simulation engineering",
    "VFX",
    "photography",
  ],
  openGraph: {
    type: "website",
    locale: "en_CA",
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.description,
    siteName: `${siteConfig.name} Portfolio`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050607",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    email: `mailto:${siteConfig.email}`,
    homeLocation: {
      "@type": "Place",
      name: siteConfig.location,
    },
    sameAs: [siteConfig.github],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Waterloo",
    },
  };

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <GlobalMotionController />
        <RouteAtmosphere />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}

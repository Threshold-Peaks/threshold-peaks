import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://www.threshold-peaks.de";
const siteName = "Threshold Peaks";
const siteTitle = "Threshold Peaks | Beat the extra mile";
const siteDescription =
  "Threshold Peaks verbindet Ausdauer, elektronische Musik und aktiven Lifestyle. Persönliche Geschichten, Training, Galerie und Events zwischen Puls, Bass und draußen unterwegs sein.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  applicationName: siteName,

  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },

  description: siteDescription,

  keywords: [
    "Threshold Peaks",
    "Beat the extra mile",
    "Ausdauer",
    "Laufen",
    "Running",
    "Radfahren",
    "Cycling",
    "Gravel",
    "Leichtathletik",
    "Training",
    "Elektronische Musik",
    "DJ",
    "Strava",
    "Events",
    "Verl",
  ],

  authors: [{ name: "Matthias Klenk" }],
  creator: "Matthias Klenk",
  publisher: siteName,
  category: "Lifestyle",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName,
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Threshold Peaks | Beat the extra mile",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f3ee",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

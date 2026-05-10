import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.threshold-peaks.de"),

  applicationName: "Threshold Peaks",

  title: {
    default: "Threshold Peaks | Beat the extra mile",
    template: "%s | Threshold Peaks",
  },

  description:
    "Threshold Peaks verbindet Laufen, Radfahren, elektronische Musik und aktiven Lifestyle. Persönliche Geschichten, Strava-Aktivitäten, Events und Momente aus Bewegung und Klang.",

  keywords: [
    "Threshold Peaks",
    "Beat the extra mile",
    "Laufen",
    "Radfahren",
    "Gravel",
    "Leichtathletik",
    "Elektronische Musik",
    "DJ",
    "Strava",
    "Ausdauer",
    "Verl",
  ],

  authors: [{ name: "Matthias Klenk" }],
  creator: "Matthias Klenk",
  publisher: "Threshold Peaks",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Threshold Peaks | Beat the extra mile",
    description:
      "Laufen, Radfahren, elektronische Musik und aktiver Lifestyle. Persönliche Geschichten, Strava-Aktivitäten, Events und Momente aus Bewegung und Klang.",
    url: "/",
    siteName: "Threshold Peaks",
    locale: "de_DE",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Threshold Peaks | Beat the extra mile",
    description:
      "Laufen, Radfahren, elektronische Musik und aktiver Lifestyle. Beat the extra mile.",
  },

  robots: {
    index: true,
    follow: true,
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
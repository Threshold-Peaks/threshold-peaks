import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Threshold Peaks | Beat the extra mile",
  description:
    "Persönliche Webseite von Matthias über Laufen, Radfahren, elektronische Musik und Bewegung.",
  keywords: [
    "Threshold Peaks",
    "Laufen",
    "Radfahren",
    "Leichtathletik",
    "Rennrad",
    "Gravelbike",
    "Elektronische Musik",
    "DJ",
    "Ausdauer",
    "Beat the extra mile",
  ],
  authors: [{ name: "Matthias Klenk" }],
  creator: "Threshold Peaks",
  openGraph: {
    title: "Threshold Peaks | Beat the extra mile",
    description:
      "Laufen, Radfahren und elektronische Musik. Bewegung, Ausdauer und Rhythmus.",
    type: "website",
    locale: "de_DE",
    siteName: "Threshold Peaks",
  },
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
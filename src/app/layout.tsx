import type { Metadata } from "next";
import "./globals.css";
import { PreferencesProvider } from "@/components/preferences";

export const metadata: Metadata = {
  title: "LEILANY LABS",
  description:
    "A playful digital engineering laboratory where everyday problems become useful software.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><PreferencesProvider>{children}</PreferencesProvider></body>
    </html>
  );
}

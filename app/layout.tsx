import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Go Nilgiris",
  description: "Discover the best places, businesses and experiences across the Nilgiris.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

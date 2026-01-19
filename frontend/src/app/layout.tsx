import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Our Story in Data",
  description: "A visualization of our connection through time",
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

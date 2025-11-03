import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pet Groove - Turn Your Pet Into a Dancing Star",
  description: "Transform your pet's photo into an amazing dancing video with AI",
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


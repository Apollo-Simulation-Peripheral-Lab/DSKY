import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DSKY Web Renderer",
  description: "React-based web renderer for the DSKY's EL Display",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </Suspense>
  );
}

import Providers from "./providers";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CodePolice",
  description: "AI-powered code review and team collaboration platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
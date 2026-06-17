import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token Predictor Visualizer",
  description: "Watch a language model generate text one token at a time, step by step.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-900">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token-by-Token Generator Visualizer",
  description: "See exactly how an LLM generates text autoregressively, one token at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-950 antialiased">{children}</body>
    </html>
  );
}

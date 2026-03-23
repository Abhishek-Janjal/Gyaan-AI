import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GPU Particle Simulation",
  description: "Real-time GPU-accelerated particle simulation with custom GLSL shaders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

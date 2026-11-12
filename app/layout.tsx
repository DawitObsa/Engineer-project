import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ICPCAS | Construction Management",
  description: "Integrated Construction Project Management and Contract Administration System",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

import type { Metadata } from "next";
import { Bricolage_Grotesque, Space_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "./components/top-nav";
import SimpleLoginGate from "./components/simple-login-gate";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Creative Lab",
  description: "Generate and refine brand images and videos with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${spaceMono.variable}`}>
        <SimpleLoginGate>
          <TopNav />
          <main>
            <div className="flex flex-col gap-6">
              {children}
            </div>
          </main>
        </SimpleLoginGate>
      </body>
    </html>
  );
}

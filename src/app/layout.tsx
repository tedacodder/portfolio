import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { getProfile } from "@/lib/data";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.name ?? "Portfolio";
  const role = profile?.role ?? "Software Engineer";
  const description = profile?.shortBio ?? profile?.bio ?? "Personal engineering portfolio.";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: `${name} — ${role}`, template: `%s — ${name}` },
    description,
    openGraph: {
      title: `${name} — ${role}`,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — ${role}`,
      description,
    },
  };
}

// Root layout: only what genuinely applies to every route, public site and
// admin console alike (fonts, base metadata). Page chrome specific to the
// public site — Navbar, Footer, ScrollProgress — lives in `(site)/layout.tsx`
// so it never renders on top of the admin shell.
//
// No custom cursor: a hand-drawn cursor that replaces the native OS pointer
// (`cursor: none` + a JS-positioned div) is a single point of failure — if it
// mispositions, lags, or fails to render for any reason, the visitor is left
// with literally no visible pointer, including over buttons and form
// controls. That's a worse outcome than not having a custom cursor at all,
// so this uses the plain native cursor everywhere.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-text antialiased">{children}</body>
    </html>
  );
}

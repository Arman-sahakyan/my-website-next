import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/hero-permit.css";
import "../styles/tokens.css";
import "../styles/global.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oregon Trucking Permit - Apply Online",
  description: "Get your Oregon trucking permits easily with our online service. Oversize, overweight, and heavy haul permits delivered by email within minutes.",
  keywords: "Oregon trucking, oversize permit, truck permit, heavy haul, oregon truck permit, oregon trucking permit, overweight permit",
  authors: [{ name: "Oregon Trucking Permit" }],
  creator: "Oregon Trucking Permit",
  publisher: "Oregon Trucking Permit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.oregontruckingpermit.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Oregon Trucking Permit - Apply Online",
    description: "Get your Oregon trucking permits easily with our online service.",
    url: "https://www.oregontruckingpermit.com",
    siteName: "Oregon Trucking Permit",
    images: [
      {
        url: '/logo.webp', // or a dedicated og-image
        width: 1200,
        height: 630,
        alt: 'Oregon Trucking Permit',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Oregon Trucking Permit - Apply Online",
    description: "Get your Oregon trucking permits easily with our online service.",
    images: ['/logo.webp'], // or a dedicated twitter-image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/logo.webp",
    shortcut: "/logo.webp",
    apple: "/logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Oregon Trucking Permit",
    url: "https://www.oregontruckingpermit.com",
    logo: "https://www.oregontruckingpermit.com/logo.webp",
    description: "Apply for Oregon trucking permits easily with our private online service.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "US"
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-503-438-7888",
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: "English"
    },
    sameAs: [] // Add your social media profiles here if available
  };

  return (
    <html lang="en">
      <head>
        <link rel="logo" href="/logo.webp" />
        <link rel="image_src" href="/logo.webp" />
        
        <link rel="preload" href="/logo.webp" as="image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

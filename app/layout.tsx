import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteData } from "@/lib/data";
import { generateRealEstateSchema, generateFAQSchema } from "@/lib/seo-schema";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f59e0b",
};

export async function generateMetadata(): Promise<Metadata> {
  const siteData = await getSiteData();
  const title = "شركة الشيد للاستثمار والتطوير العقاري | شقق فاخرة للإيجار في بغداد";
  const titleEn = "Al-Sheed Real Estate | Luxury Apartments for Rent in Baghdad";
  const description =
    "أرقى الشقق السكنية الفاخرة للإيجار المباشر من المالك في بغداد (العرصات، شارع السدة، أبو نؤاس، الجادرية). شقق مفروشة وغير مفروشة، كهرباء 24/7، حراسة، مصاعد، إطلالات نهرية خلابة، بدون عمولة وسطاء 0%. تواصل الآن: 07725437001.";

  return {
    metadataBase: new URL("https://sheed.iq"),
    title: {
      default: title,
      template: "%s | شركة الشيد للتطوير العقاري",
    },
    description,
    applicationName: "شركة الشيد العقارية",
    authors: [{ name: "شركة الشيد للاستثمار والتطوير العقاري", url: "https://sheed.iq" }],
    creator: "شركة الشيد",
    publisher: "شركة الشيد",
    keywords: [
      "شركة الشيد",
      "شركة الشيد للاستثمار والتطوير العقاري",
      "شقق للايجار في بغداد",
      "شقق للايجار العرصات",
      "شقق للايجار شارع السدة",
      "شقق للايجار ابو نؤاس",
      "شقق للايجار الجادرية",
      "شقق مفروشة بغداد",
      "شقق للايجار من المالك مباشرة",
      "بنايات الشيد",
      "ايجار شقق بغداد بدون عمولة",
      "بنتهاوس للايجار بغداد",
      "عقارات بغداد",
      "Al-Sheed Real Estate",
      "apartments for rent in Baghdad",
      "luxury apartments Baghdad",
      "furnished apartments Arasat Baghdad",
      "Abu Nuwas rental apartments",
    ],
    alternates: {
      canonical: "https://sheed.iq",
      languages: {
        "ar-IQ": "https://sheed.iq",
        "en-US": "https://sheed.iq?lang=en",
        "x-default": "https://sheed.iq",
      },
    },
    openGraph: {
      title,
      description,
      url: "https://sheed.iq",
      siteName: "شركة الشيد العقارية | Al-Sheed Real Estate",
      locale: "ar_IQ",
      alternateLocale: ["en_US"],
      type: "website",
      images: [
        {
          url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=630&q=85&auto=format&fit=crop",
          width: 1200,
          height: 630,
          alt: "شقق شركة الشيد الفاخرة للإيجار في بغداد - العرصات وأبو نؤاس",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=630&q=85&auto=format&fit=crop",
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
      shortcut: ["/icon.svg"],
    },
    other: {
      "geo.region": "IQ-BG",
      "geo.placename": "Baghdad",
      "geo.position": "33.3152;44.3661",
      "ICBM": "33.3152, 44.3661",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteData = await getSiteData();
  const realEstateSchema = generateRealEstateSchema(siteData);
  const faqSchema = generateFAQSchema();

  return (
    <html lang="ar" dir="rtl" className="dark h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        {/* Anti-FOUC Theme Script: runs synchronously before first paint to eliminate any millisecond white flash on refresh */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sheed_theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Alexandria:wght@400;500;600;700;800;900&family=Almarai:wght@400;700;800&family=Tajawal:wght@400;500;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Google Structured Data (JSON-LD) for #1 Search Engine Ranking */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 dark:bg-[#0B1220] dark:text-slate-100 antialiased selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

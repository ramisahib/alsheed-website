import { MetadataRoute } from "next";
import { getSiteData } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sheed.iq";
  const siteData = await getSiteData();
  const currentDate = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(siteData.updatedAt || currentDate),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          ar: `${baseUrl}?lang=ar`,
          en: `${baseUrl}?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}#properties`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}#buildings`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}#guide`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}#why-us`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}#faq`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Add individual building sections
  if (siteData.buildings) {
    for (const bName of Object.keys(siteData.buildings)) {
      entries.push({
        url: `${baseUrl}?building=${encodeURIComponent(bName)}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}

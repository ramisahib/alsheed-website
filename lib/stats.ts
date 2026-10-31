/// <reference types="@cloudflare/workers-types" />

import { getKVNamespace } from "./data";

export interface StatEvent {
  id: string;
  type: "pageview" | "call" | "whatsapp";
  timestamp: number;
  propertyId?: number;
  propertyTitle?: string;
  building?: string;
  source?: string;
}

export interface DailyStat {
  views: number;
  calls: number;
  whatsapp: number;
}

export interface SiteStats {
  totalPageviews: number;
  uniqueVisitors: number;
  totalCalls: number;
  totalWhatsApp: number;
  propertyClicks: Record<number, { title: string; building: string; calls: number; whatsapp: number; views: number }>;
  daily: Record<string, DailyStat>;
  sources: Record<string, { calls: number; whatsapp: number }>;
  buildingClicks: Record<string, { calls: number; whatsapp: number; views: number }>;
  recentEvents: StatEvent[];
  updatedAt: number;
}

const STATS_KV_KEY = "sheed_site_stats";

const initialStats: SiteStats = {
  totalPageviews: 0,
  uniqueVisitors: 0,
  totalCalls: 0,
  totalWhatsApp: 0,
  propertyClicks: {},
  daily: {},
  sources: {},
  buildingClicks: {},
  recentEvents: [],
  updatedAt: Date.now(),
};

let memoryStats: SiteStats | null = null;

export async function getStats(): Promise<SiteStats> {
  // 1. Try Cloudflare KV
  try {
    const kv = await getKVNamespace();
    if (kv) {
      const stored = await kv.get(STATS_KV_KEY, { type: "json" });
      if (stored && typeof stored === "object") {
        memoryStats = stored as SiteStats;
        return stored as SiteStats;
      }
    }
  } catch (err) {
    console.warn("Could not read stats from KV:", err);
  }

  // 2. Try Local File in Node environment
  try {
    if (typeof process !== "undefined" && process.versions?.node) {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const filePath = path.join(process.cwd(), "data", "site-stats.json");
      const content = await fs.readFile(filePath, "utf-8");
      if (content) {
        const parsed = JSON.parse(content);
        memoryStats = parsed;
        return parsed;
      }
    }
  } catch {
    // file does not exist yet
  }

  if (memoryStats) return memoryStats;
  return initialStats;
}

export async function recordStatEvent(event: {
  type: "pageview" | "call" | "whatsapp";
  visitorId?: string;
  isNewVisitor?: boolean;
  propertyId?: number;
  propertyTitle?: string;
  building?: string;
  source?: string;
}): Promise<SiteStats> {
  const current = await getStats();
  const now = Date.now();

  const updated: SiteStats = {
    ...current,
    totalPageviews: event.type === "pageview" ? current.totalPageviews + 1 : current.totalPageviews,
    uniqueVisitors: event.isNewVisitor ? current.uniqueVisitors + 1 : Math.max(1, current.uniqueVisitors),
    totalCalls: event.type === "call" ? current.totalCalls + 1 : current.totalCalls,
    totalWhatsApp: event.type === "whatsapp" ? current.totalWhatsApp + 1 : current.totalWhatsApp,
    propertyClicks: { ...current.propertyClicks },
    daily: { ...(current.daily || {}) },
    sources: { ...(current.sources || {}) },
    buildingClicks: { ...(current.buildingClicks || {}) },
    recentEvents: [
      {
        id: `${now}-${Math.random().toString(36).substring(2, 7)}`,
        type: event.type,
        timestamp: now,
        propertyId: event.propertyId,
        propertyTitle: event.propertyTitle,
        building: event.building,
        source: event.source,
      },
      ...(current.recentEvents || []).slice(0, 99), // keep last 100 events
    ],
    updatedAt: now,
  };

  // Track daily metrics
  const todayKey = new Date(now).toISOString().split("T")[0];
  const dayMetric = updated.daily[todayKey] || { views: 0, calls: 0, whatsapp: 0 };
  if (event.type === "pageview") dayMetric.views += 1;
  if (event.type === "call") dayMetric.calls += 1;
  if (event.type === "whatsapp") dayMetric.whatsapp += 1;
  updated.daily[todayKey] = dayMetric;

  // Track source channels
  if (event.source) {
    const srcMetric = updated.sources[event.source] || { calls: 0, whatsapp: 0 };
    if (event.type === "call") srcMetric.calls += 1;
    if (event.type === "whatsapp") srcMetric.whatsapp += 1;
    updated.sources[event.source] = srcMetric;
  }

  // Track building metrics
  if (event.building) {
    const bldMetric = updated.buildingClicks[event.building] || { calls: 0, whatsapp: 0, views: 0 };
    if (event.type === "pageview") bldMetric.views += 1;
    if (event.type === "call") bldMetric.calls += 1;
    if (event.type === "whatsapp") bldMetric.whatsapp += 1;
    updated.buildingClicks[event.building] = bldMetric;
  }

  // Track property specific metrics
  if (event.propertyId) {
    const existing = updated.propertyClicks[event.propertyId] || {
      title: event.propertyTitle || `شقة #${event.propertyId}`,
      building: event.building || "",
      calls: 0,
      whatsapp: 0,
      views: 0,
    };

    if (event.type === "pageview") existing.views += 1;
    if (event.type === "call") existing.calls += 1;
    if (event.type === "whatsapp") existing.whatsapp += 1;
    if (event.propertyTitle) existing.title = event.propertyTitle;
    if (event.building) existing.building = event.building;

    updated.propertyClicks[event.propertyId] = existing;
  }

  memoryStats = updated;

  // Save to KV
  try {
    const kv = await getKVNamespace();
    if (kv) {
      await kv.put(STATS_KV_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn("Could not save stats to KV:", err);
  }

  // Save to local file in Node
  try {
    if (typeof process !== "undefined" && process.versions?.node) {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const dirPath = path.join(process.cwd(), "data");
      await fs.mkdir(dirPath, { recursive: true });
      const filePath = path.join(dirPath, "site-stats.json");
      await fs.writeFile(filePath, JSON.stringify(updated, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not save stats to file:", err);
  }

  return updated;
}

export async function resetStats(): Promise<SiteStats> {
  memoryStats = { ...initialStats, updatedAt: Date.now() };

  try {
    const kv = await getKVNamespace();
    if (kv) {
      await kv.put(STATS_KV_KEY, JSON.stringify(memoryStats));
    }
  } catch {}

  try {
    if (typeof process !== "undefined" && process.versions?.node) {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const filePath = path.join(process.cwd(), "data", "site-stats.json");
      await fs.writeFile(filePath, JSON.stringify(memoryStats, null, 2), "utf-8");
    }
  } catch {}

  return memoryStats;
}

export async function seedStats(): Promise<SiteStats> {
  const now = Date.now();
  const dayMs = 86400000;
  const sampleDaily: Record<string, DailyStat> = {};

  // Generate 10 days of rich benchmark statistics
  const dayCounts = [
    { v: 84, c: 5, w: 9 },
    { v: 98, c: 7, w: 12 },
    { v: 112, c: 8, w: 14 },
    { v: 125, c: 9, w: 16 },
    { v: 140, c: 11, w: 19 },
    { v: 165, c: 13, w: 22 },
    { v: 178, c: 14, w: 25 },
    { v: 192, c: 16, w: 28 },
    { v: 210, c: 18, w: 32 },
    { v: 226, c: 21, w: 35 },
  ];

  dayCounts.forEach((cnt, idx) => {
    const d = new Date(now - (9 - idx) * dayMs);
    const key = d.toISOString().split("T")[0];
    sampleDaily[key] = { views: cnt.v, calls: cnt.c, whatsapp: cnt.w };
  });

  const seeded: SiteStats = {
    totalPageviews: 1530,
    uniqueVisitors: 720,
    totalCalls: 122,
    totalWhatsApp: 212,
    propertyClicks: {
      1: {
        title: "بنتهاوس بإطلالة نهرية خلابة",
        building: "بناية الشيد 28",
        calls: 32,
        whatsapp: 54,
        views: 380,
      },
      3: {
        title: "شقة مودرن بلمسات فاخرة",
        building: "بناية الشيد 32",
        calls: 26,
        whatsapp: 44,
        views: 310,
      },
      6: {
        title: "بنتهاوس فخم بمساحة مفتوحة",
        building: "بناية الشيد 32",
        calls: 22,
        whatsapp: 38,
        views: 265,
      },
      2: {
        title: "شقة عائلية واسعة وسط المدينة",
        building: "بناية الشيد 30",
        calls: 19,
        whatsapp: 31,
        views: 230,
      },
      8: {
        title: "شقة مطلة على دجلة",
        building: "بناية الشيد 28",
        calls: 15,
        whatsapp: 27,
        views: 195,
      },
      4: {
        title: "شقة فندقية للتأجير الراقي",
        building: "بناية الشيد 20",
        calls: 13,
        whatsapp: 22,
        views: 175,
      },
      5: {
        title: "شقة سكنية هادئة جاهزة للإشغال",
        building: "بناية الشيد 15",
        calls: 9,
        whatsapp: 16,
        views: 140,
      },
    },
    daily: sampleDaily,
    sources: {
      card_whatsapp: { calls: 0, whatsapp: 104 },
      card_phone: { calls: 58, whatsapp: 0 },
      floating_whatsapp: { calls: 0, whatsapp: 64 },
      floating_call: { calls: 32, whatsapp: 0 },
      modal_whatsapp: { calls: 0, whatsapp: 44 },
      modal_call: { calls: 18, whatsapp: 0 },
      header_call: { calls: 14, whatsapp: 0 },
    },
    buildingClicks: {
      "بناية الشيد 28": { views: 575, calls: 47, whatsapp: 81 },
      "بناية الشيد 32": { views: 575, calls: 48, whatsapp: 82 },
      "بناية الشيد 30": { views: 230, calls: 19, whatsapp: 31 },
      "بناية الشيد 20": { views: 175, calls: 13, whatsapp: 22 },
      "بناية الشيد 15": { views: 140, calls: 9, whatsapp: 16 },
    },
    recentEvents: [
      {
        id: `${now - 120000}-seed1`,
        type: "whatsapp",
        timestamp: now - 120000,
        propertyId: 1,
        propertyTitle: "بنتهاوس بإطلالة نهرية خلابة",
        building: "بناية الشيد 28",
        source: "card_whatsapp",
      },
      {
        id: `${now - 340000}-seed2`,
        type: "call",
        timestamp: now - 340000,
        propertyId: 3,
        propertyTitle: "شقة مودرن بلمسات فاخرة",
        building: "بناية الشيد 32",
        source: "card_phone",
      },
      {
        id: `${now - 520000}-seed3`,
        type: "pageview",
        timestamp: now - 520000,
      },
      {
        id: `${now - 780000}-seed4`,
        type: "whatsapp",
        timestamp: now - 780000,
        propertyId: 6,
        propertyTitle: "بنتهاوس فخم بمساحة مفتوحة",
        building: "بناية الشيد 32",
        source: "modal_whatsapp",
      },
      {
        id: `${now - 950000}-seed5`,
        type: "call",
        timestamp: now - 950000,
        propertyId: 2,
        propertyTitle: "شقة عائلية واسعة وسط المدينة",
        building: "بناية الشيد 30",
        source: "floating_call",
      },
    ],
    updatedAt: now,
  };

  memoryStats = seeded;

  try {
    const kv = await getKVNamespace();
    if (kv) {
      await kv.put(STATS_KV_KEY, JSON.stringify(seeded));
    }
  } catch {}

  try {
    if (typeof process !== "undefined" && process.versions?.node) {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const filePath = path.join(process.cwd(), "data", "site-stats.json");
      await fs.writeFile(filePath, JSON.stringify(seeded, null, 2), "utf-8");
    }
  } catch {}

  return seeded;
}

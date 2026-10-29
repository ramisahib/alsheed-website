/// <reference types="@cloudflare/workers-types" />

import { SiteData } from "./types";
import { initialData } from "./initial-data";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const KV_KEY = "sheed_site_data";

export async function getKVNamespace(): Promise<KVNamespace | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as any)?.SHEED_DATA || null;
  } catch {
    return null;
  }
}

export async function getSiteData(): Promise<SiteData> {
  try {
    const kv = await getKVNamespace();
    if (kv) {
      const stored = await kv.get(KV_KEY, { type: "json" });
      if (stored && typeof stored === "object") {
        return stored as SiteData;
      }
    }
  } catch (err) {
    console.error("Error reading from KV:", err);
  }
  return initialData;
}

export async function saveSiteData(data: SiteData): Promise<{ success: boolean; error?: string }> {
  try {
    const kv = await getKVNamespace();
    if (!kv) {
      return { 
        success: false, 
        error: "Cloudflare KV namespace SHEED_DATA is not bound. In production, ensure SHEED_DATA KV is linked in Cloudflare dashboard." 
      };
    }
    data.updatedAt = Date.now();
    await kv.put(KV_KEY, JSON.stringify(data));
    return { success: true };
  } catch (err: any) {
    console.error("Error saving to KV:", err);
    return { success: false, error: err?.message || "Failed to save data to KV" };
  }
}

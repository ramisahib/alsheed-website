/// <reference types="@cloudflare/workers-types" />

import { SiteData } from "./types";
import { initialData } from "./initial-data";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const KV_KEY = "sheed_site_data";
let inMemoryData: SiteData | null = null;

export async function getKVNamespace(): Promise<KVNamespace | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as any)?.SHEED_DATA || null;
  } catch {
    return null;
  }
}

export async function getSiteData(): Promise<SiteData> {
  // 1. Try Cloudflare KV
  try {
    const kv = await getKVNamespace();
    if (kv) {
      const stored = await kv.get(KV_KEY, { type: "json" });
      if (stored && typeof stored === "object") {
        inMemoryData = stored as SiteData;
        return stored as SiteData;
      }
    }
  } catch (err) {
    console.warn("Could not read from Cloudflare KV:", err);
  }

  // 2. Try Local Filesystem (Node.js dev or server)
  try {
    if (typeof process !== "undefined" && process.versions?.node) {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const filePath = path.join(process.cwd(), "data", "site-data.json");
      const raw = await fs.readFile(filePath, "utf-8");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          inMemoryData = parsed as SiteData;
          return parsed as SiteData;
        }
      }
    }
  } catch {
    // Local data file doesn't exist yet, fall through
  }

  // 3. In-memory cached data
  if (inMemoryData) {
    return inMemoryData;
  }

  return initialData;
}

export async function saveSiteData(data: SiteData): Promise<{ success: boolean; error?: string; target?: string }> {
  data.updatedAt = Date.now();
  inMemoryData = data;
  let savedToKV = false;
  let savedToFile = false;

  // 1. Save to Cloudflare KV if bound
  try {
    const kv = await getKVNamespace();
    if (kv) {
      await kv.put(KV_KEY, JSON.stringify(data));
      savedToKV = true;
    }
  } catch (err) {
    console.warn("Could not write to Cloudflare KV:", err);
  }

  // 2. Save to local filesystem if running in Node.js
  try {
    if (typeof process !== "undefined" && process.versions?.node) {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const dirPath = path.join(process.cwd(), "data");
      await fs.mkdir(dirPath, { recursive: true });
      const filePath = path.join(dirPath, "site-data.json");
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      savedToFile = true;
    }
  } catch (err) {
    console.warn("Could not write to local filesystem:", err);
  }

  return {
    success: true,
    target: savedToKV ? (savedToFile ? "kv+file" : "kv") : (savedToFile ? "file" : "memory"),
  };
}

/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  SHEED_DATA?: KVNamespace;
  ADMIN_PASSWORD?: string;
  ASSETS?: Fetcher;
}

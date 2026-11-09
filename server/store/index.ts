import path from "node:path";
import { isProduction, supabaseServer } from "../config.js";
import { FileStore } from "./fileStore.js";
import { SupabaseStore } from "./supabaseStore.js";
import type { Store } from "./types.js";

let cached: Store | null = null;

/**
 * Supabase when the service key is set. Otherwise a local JSON file
 * (laptop demo only). Production always requires Supabase.
 */
export function getStore(): Store {
  if (cached) return cached;
  const sb = supabaseServer();
  if (sb) {
    cached = new SupabaseStore(sb.url, sb.serviceKey);
  } else {
    if (isProduction()) throw new Error("Missing setting: SUPABASE_SERVICE_ROLE_KEY");
    cached = new FileStore(path.resolve(process.cwd(), ".demo", "store.json"));
  }
  return cached;
}

export function setStoreForTests(store: Store | null) {
  cached = store;
}

export type { Store } from "./types.js";

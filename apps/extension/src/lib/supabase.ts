
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase environment variables");
}

const chromeStorageLocal = (globalThis as unknown as {
  chrome: {
    storage: {
      local: {
        get(key: string): Promise<Record<string, unknown>>;
        set(items: Record<string, string>): Promise<void>;
        remove(key: string): Promise<void>;
      };
    };
  };
}).chrome.storage.local;

const chromeStorage = {
  async getItem(key: string): Promise<string | null> {
    const result = await chromeStorageLocal.get(key);
    const value = result[key];

    return typeof value === "string" ? value : null;
  },

  async setItem(key: string, value: string): Promise<void> {
    await chromeStorageLocal.set({ [key]: value });
  },

  async removeItem(key: string): Promise<void> {
    await chromeStorageLocal.remove(key);
  },
};

export const supabase = createClient(url, key, {
  auth: {
    storage: chromeStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

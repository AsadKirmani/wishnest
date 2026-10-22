
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return json({ error: "Please log in to view this collection." }, 401);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return json({ error: "Please log in to view this collection." }, 401);
    }

    const { token } = await req.json();

    if (
      typeof token !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(token)
    ) {
      return json({ error: "Invalid or unavailable share link." }, 404);
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const tokenHash = await sha256(token);

    const { data: link, error: linkError } = await admin
      .from("share_links")
      .select("id, collection_id, expires_at, revoked_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (linkError) throw linkError;

    if (
      !link ||
      link.revoked_at ||
      (link.expires_at && Date.parse(link.expires_at) <= Date.now())
    ) {
      return json({ error: "This share link is invalid or expired." }, 404);
    }

    const { data: collection, error: collectionError } = await admin
      .from("collections")
      .select("id, name, description, visibility, created_at")
      .eq("id", link.collection_id)
      .maybeSingle();

    if (collectionError) throw collectionError;

    if (!collection) {
      return json({ error: "Collection not found." }, 404);
    }

    const { data: items, error: itemsError } = await admin
      .from("collection_items")
      .select(`
        collection_id,
        product_id,
        note,
        position,
        added_at,
        product:products (
          id,
          canonical_url,
          title,
          image_url,
          current_price,
          currency
        )
      `)
      .eq("collection_id", collection.id)
      .order("position", { ascending: true });

    if (itemsError) throw itemsError;

    return json({
      collection,
      products: (items ?? []).filter((item) => item.product !== null),
    });
  } catch (error) {
    console.error("get-shared-collection:", error);
    return json({ error: "Could not load the shared collection." }, 500);
  }
});

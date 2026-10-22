
// @ts-ignore Deno resolves npm: imports; TypeScript language servers may not.
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

function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
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
      return json({ error: "Authentication required." }, 401);
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
      return json({ error: "Invalid or expired session." }, 401);
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    const collectionId = body.collectionId;
    const action = body.action ?? "create";

    if (
      typeof collectionId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(collectionId)
    ) {
      return json({ error: "Invalid collection ID." }, 400);
    }

    const { data: collection, error: collectionError } = await admin
      .from("collections")
      .select("id, owner_id")
      .eq("id", collectionId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (collectionError) {
      throw collectionError;
    }

    if (!collection) {
      return json({ error: "Collection not found." }, 404);
    }

    if (action === "revoke") {
      const { error } = await admin
        .from("share_links")
        .update({ revoked_at: new Date().toISOString() })
        .eq("collection_id", collectionId)
        .is("revoked_at", null);

      if (error) throw error;

      return json({ success: true });
    }

    if (action !== "create") {
      return json({ error: "Invalid action." }, 400);
    }

    const token = generateToken();
    const tokenHash = await sha256(token);

    const { error: insertError } = await admin
      .from("share_links")
      .insert({
        collection_id: collectionId,
        token_hash: tokenHash,
      });

    if (insertError) throw insertError;

    // Return the raw token only once. Never store it in the database.
    return json({ token });
  } catch (error) {
    console.error("create-share-link:", error);
    return json({ error: "Could not process the share link." }, 500);
  }
});

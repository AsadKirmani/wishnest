
import { supabase } from "../../../lib/supabase";
import type { ProductDraft } from "../types";

export interface SaveProductInput extends ProductDraft {
  collectionId: string;
}

export const productRepository = {
  async save(input: SaveProductInput): Promise<void> {
    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("Please sign in before saving a product.");
    }

    const parsedUrl = new URL(input.url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Product URL must use HTTP or HTTPS.");
    }

    const canonicalUrl = parsedUrl.href;
    const ownerId = userData.user.id;

    const { data: existing, error: lookupError } = await supabase
      .from("products")
      .select("id")
      .eq("owner_id", ownerId)
      .eq("canonical_url", canonicalUrl)
      .maybeSingle();

    if (lookupError) {
      throw new Error(lookupError.message);
    }

    let productId: string;

    if (existing) {
      productId = existing.id;
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert({
          owner_id: ownerId,
          canonical_url: canonicalUrl,
          title: input.title.trim(),
          image_url: input.imageUrl,
          current_price: input.price,
          currency: input.currency,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      productId = data.id;
    }

    const { error: itemError } = await supabase
      .from("collection_items")
      .insert({
        collection_id: input.collectionId,
        product_id: productId,
      });

    if (itemError?.code === "23505") {
      throw new Error("This product is already saved in that collection.");
    }

    if (itemError) {
      throw new Error(itemError.message);
    }
  },
};

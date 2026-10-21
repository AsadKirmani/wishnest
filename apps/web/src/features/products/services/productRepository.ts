
import { supabase } from "../../../lib/supabase";
import type {
  Product,
  SaveProductInput,
  SavedCollectionProduct,
} from "../types";

const PRODUCTS_TABLE = "products";
const ITEMS_TABLE = "collection_items";

export const productRepository = {
  async getByCollection(
    collectionId: string,
  ): Promise<SavedCollectionProduct[]> {
    const { data, error } = await supabase
      .from(ITEMS_TABLE)
      .select(`
        collection_id,
        product_id,
        note,
        position,
        added_at,
        product:products (
          id,
          owner_id,
          canonical_url,
          title,
          image_url,
          current_price,
          currency,
          created_at,
          updated_at
        )
      `)
      .eq("collection_id", collectionId)
      .order("position", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).flatMap((row) => {
      if (!row.product) return [];

      return [{
        item: {
          collection_id: row.collection_id,
          product_id: row.product_id,
          note: row.note,
          position: row.position,
          added_at: row.added_at,
        },
        product: row.product as unknown as Product,
      }];
    });
  },

  async save(input: SaveProductInput): Promise<Product> {
    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to save a product.");
    }

    const url = input.url.trim();
    const title = input.title.trim();

    if (!title) {
      throw new Error("Product title is required.");
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error("Enter a valid product URL.");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Product URL must use HTTP or HTTPS.");
    }

    const canonicalUrl = parsedUrl.href;

    const { data: existing, error: lookupError } = await supabase
      .from(PRODUCTS_TABLE)
      .select("*")
      .eq("owner_id", userData.user.id)
      .eq("canonical_url", canonicalUrl)
      .maybeSingle();

    if (lookupError) throw new Error(lookupError.message);

    let product: Product;

    if (existing) {
      product = existing as Product;
    } else {
      const { data, error } = await supabase
        .from(PRODUCTS_TABLE)
        .insert({
          owner_id: userData.user.id,
          canonical_url: canonicalUrl,
          title,
          image_url: input.imageUrl?.trim() || null,
          current_price: input.price ?? null,
          currency: input.currency?.trim() || null,
        })
        .select("*")
        .single();

      if (error) throw new Error(error.message);

      product = data as Product;
    }

    const { error: itemError } = await supabase
      .from(ITEMS_TABLE)
      .insert({
        collection_id: input.collectionId,
        product_id: product.id,
        note: input.note?.trim() || null,
      });

    if (itemError) {
      if (itemError.code === "23505") {
        throw new Error("This product is already in that collection.");
      }

      throw new Error(itemError.message);
    }

    return product;
  },

  async removeFromCollection(
    collectionId: string,
    productId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from(ITEMS_TABLE)
      .delete()
      .eq("collection_id", collectionId)
      .eq("product_id", productId);

    if (error) throw new Error(error.message);
  },
};

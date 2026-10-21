import type { SupabaseClient } from "@supabase/supabase-js";

export type CollectionVisibility = "private" | "public";

export interface Collection {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  visibility: CollectionVisibility;
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionInput {
  name: string;
  description?: string | null;
  visibility?: CollectionVisibility;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string | null;
  visibility?: CollectionVisibility;
}

export interface Product {
  id: string;
  owner_id: string;
  canonical_url: string;
  title: string;
  image_url: string | null;
  current_price: number | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  collection_id: string;
  product_id: string;
  note: string | null;
  position: number;
  added_at: string;
}

export interface SaveProductInput {
  collectionId: string;
  url: string;
  title: string;
  imageUrl?: string | null;
  price?: number | null;
  currency?: string | null;
  note?: string | null;
}

export interface SavedCollectionProduct {
  product: Product;
  item: CollectionItem;
}

export interface DashboardCollection extends Collection {
  productCount: number;
}

export interface RecentProduct {
  id: string;
  title: string;
  canonical_url: string;
  image_url: string | null;
  current_price: number | null;
  currency: string | null;
  collectionId: string;
  collectionName: string;
  addedAt: string;
}

export interface DashboardData {
  collections: DashboardCollection[];
  recentProducts: RecentProduct[];
}

export function createCollectionRepository(client: SupabaseClient) {
  return {
    async getById(id: string): Promise<Collection> {
      const { data, error } = await client
        .from("collections")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      return data as Collection;
    },

    async getAll(): Promise<Collection[]> {
      const { data, error } = await client
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as Collection[];
    },

    async create(input: CreateCollectionInput): Promise<Collection> {
      const { data: userData, error: userError } = await client.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("You must be logged in to create a collection.");
      }

      const { data, error } = await client
        .from("collections")
        .insert({
          owner_id: userData.user.id,
          name: input.name.trim(),
          description: input.description?.trim() || null,
          visibility: input.visibility ?? "private",
        })
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return data as Collection;
    },

    async update(id: string, input: UpdateCollectionInput): Promise<Collection> {
      const updates: UpdateCollectionInput = {};
      if (input.name !== undefined) updates.name = input.name.trim();
      if (input.description !== undefined) {
        updates.description = input.description?.trim() || null;
      }
      if (input.visibility !== undefined) updates.visibility = input.visibility;

      const { data, error } = await client
        .from("collections")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return data as Collection;
    },

    async delete(id: string): Promise<void> {
      const { error } = await client.from("collections").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
  };
}

export function createProductRepository(client: SupabaseClient) {
  return {
    async getByCollection(collectionId: string): Promise<SavedCollectionProduct[]> {
      const { data, error } = await client
        .from("collection_items")
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

      return (data ?? []).flatMap((row: any) => {
        if (!row.product) return [];
        return [{
          item: {
            collection_id: row.collection_id,
            product_id: row.product_id,
            note: row.note,
            position: row.position,
            added_at: row.added_at,
          } as CollectionItem,
          product: row.product as unknown as Product,
        }];
      });
    },

    async save(input: SaveProductInput): Promise<Product> {
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("You must be logged in to save a product.");
      }

      const title = input.title.trim();
      if (!title) throw new Error("Product title is required.");

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(input.url.trim());
      } catch {
        throw new Error("Enter a valid product URL.");
      }
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Product URL must use HTTP or HTTPS.");
      }

      const canonicalUrl = parsedUrl.href;
      const { data: existing, error: lookupError } = await client
        .from("products")
        .select("*")
        .eq("owner_id", userData.user.id)
        .eq("canonical_url", canonicalUrl)
        .maybeSingle();

      if (lookupError) throw new Error(lookupError.message);

      let product: Product;
      if (existing) {
        product = existing as Product;
      } else {
        const { data, error } = await client
          .from("products")
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

      const { error: itemError } = await client
        .from("collection_items")
        .insert({
          collection_id: input.collectionId,
          product_id: product.id,
          note: input.note?.trim() || null,
        });

      if (itemError?.code === "23505") {
        throw new Error("This product is already in that collection.");
      }
      if (itemError) throw new Error(itemError.message);

      return product;
    },

    async removeFromCollection(collectionId: string, productId: string): Promise<void> {
      const { error } = await client
        .from("collection_items")
        .delete()
        .eq("collection_id", collectionId)
        .eq("product_id", productId);

      if (error) throw new Error(error.message);
    },
  };
}

export function createDashboardRepository(client: SupabaseClient) {
  return {
    async getData(): Promise<DashboardData> {
      const { data: collectionData, error: collectionError } = await client
        .from("collections")
        .select("id, owner_id, name, description, visibility, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (collectionError) throw new Error(collectionError.message);
      const collections = (collectionData ?? []) as Collection[];
      if (collections.length === 0) return { collections: [], recentProducts: [] };

      const { data: itemData, error: itemError } = await client
        .from("collection_items")
        .select("collection_id, product_id, added_at")
        .order("added_at", { ascending: false });

      if (itemError) throw new Error(itemError.message);
      const items = itemData ?? [];
      const productCounts = new Map<string, number>();
      for (const item of items) {
        productCounts.set(item.collection_id, (productCounts.get(item.collection_id) ?? 0) + 1);
      }

      const dashboardCollections: DashboardCollection[] = collections.map((collection) => ({
        ...collection,
        productCount: productCounts.get(collection.id) ?? 0,
      }));

      if (items.length === 0) return { collections: dashboardCollections, recentProducts: [] };

      const productIds = [...new Set(items.map((item) => item.product_id))];
      const { data: productData, error: productError } = await client
        .from("products")
        .select("id, title, canonical_url, image_url, current_price, currency")
        .in("id", productIds);

      if (productError) throw new Error(productError.message);
      const productsById = new Map((productData ?? []).map((product) => [product.id, product]));
      const collectionsById = new Map(dashboardCollections.map((collection) => [collection.id, collection.name]));

      const recentProducts: RecentProduct[] = items.flatMap((item) => {
        const product = productsById.get(item.product_id);
        const collectionName = collectionsById.get(item.collection_id);
        if (!product || !collectionName) return [];
        return [{ ...product, collectionId: item.collection_id, collectionName, addedAt: item.added_at }];
      }).slice(0, 5);

      return { collections: dashboardCollections, recentProducts };
    }
  };
}

export function validateCollectionName(
  name: string,
  existingCollections: Array<{ id: string; name: string }>,
  excludeId?: string,
): string | null {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "Collection name is required.";
  }

  if (trimmedName.length > 80) {
    return "Collection name must be 80 characters or fewer.";
  }

  const normalizedName = trimmedName.toLowerCase();

  const duplicateExists = existingCollections.some(
    (collection) =>
      collection.id !== excludeId &&
      collection.name.trim().toLowerCase() === normalizedName,
  );

  if (duplicateExists) {
    return "A collection with this name already exists.";
  }

  return null;
}


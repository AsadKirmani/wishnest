
import { supabase } from "../../../lib/supabase";

export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  visibility: "private" | "public";
  created_at: string;
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

export const dashboardRepository = {
  async getData(): Promise<DashboardData> {
    const { data: collectionData, error: collectionError } =
      await supabase
        .from("collections")
        .select("id, name, description, visibility, created_at")
        .order("created_at", { ascending: false });

    if (collectionError) {
      throw new Error(collectionError.message);
    }

    const collections = collectionData ?? [];

    if (collections.length === 0) {
      return { collections: [], recentProducts: [] };
    }

    const { data: itemData, error: itemError } = await supabase
      .from("collection_items")
      .select("collection_id, product_id, added_at")
      .order("added_at", { ascending: false });

    if (itemError) {
      throw new Error(itemError.message);
    }

    const items = itemData ?? [];
    const productCounts = new Map<string, number>();

    for (const item of items) {
      productCounts.set(
        item.collection_id,
        (productCounts.get(item.collection_id) ?? 0) + 1,
      );
    }

    const dashboardCollections: DashboardCollection[] = collections.map(
      (collection) => ({
        ...collection,
        visibility: collection.visibility as "private" | "public",
        productCount: productCounts.get(collection.id) ?? 0,
      }),
    );

    if (items.length === 0) {
      return {
        collections: dashboardCollections,
        recentProducts: [],
      };
    }

    const productIds = [...new Set(items.map((item) => item.product_id))];

    const { data: productData, error: productError } = await supabase
      .from("products")
      .select(
        "id, title, canonical_url, image_url, current_price, currency",
      )
      .in("id", productIds);

    if (productError) {
      throw new Error(productError.message);
    }

    const productsById = new Map(
      (productData ?? []).map((product) => [product.id, product]),
    );

    const collectionsById = new Map(
      dashboardCollections.map((collection) => [
        collection.id,
        collection.name,
      ]),
    );

    const recentProducts: RecentProduct[] = items
      .map((item) => {
        const product = productsById.get(item.product_id);
        const collectionName = collectionsById.get(item.collection_id);

        if (!product || !collectionName) {
          return null;
        }

        return {
          ...product,
          collectionId: item.collection_id,
          collectionName,
          addedAt: item.added_at,
        };
      })
      .filter((item): item is RecentProduct => item !== null)
      .slice(0, 5);

    return {
      collections: dashboardCollections,
      recentProducts,
    };
  },
  
async getCollectionProducts(
  collectionId: string,
): Promise<RecentProduct[]> {
  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("id, name")
    .eq("id", collectionId)
    .single();

  if (collectionError) {
    throw new Error(collectionError.message);
  }

  const { data: items, error: itemError } = await supabase
    .from("collection_items")
    .select("product_id, added_at, collection_id")
    .eq("collection_id", collectionId)
    .order("added_at", { ascending: false });

  if (itemError) {
    throw new Error(itemError.message);
  }

  if (!items?.length) {
    return [];
  }

  const productIds = [...new Set(items.map((item) => item.product_id))];

  const { data: products, error: productError } = await supabase
    .from("products")
    .select(
      "id, title, canonical_url, image_url, current_price, currency",
    )
    .in("id", productIds);

  if (productError) {
    throw new Error(productError.message);
  }

  const productsById = new Map(
    (products ?? []).map((product) => [product.id, product]),
  );

  return items.flatMap((item) => {
    const product = productsById.get(item.product_id);

    if (!product) {
      return [];
    }

    return [
      {
        ...product,
        collectionId: collection.id,
        collectionName: collection.name,
        addedAt: item.added_at,
      },
    ];
  });
},

};

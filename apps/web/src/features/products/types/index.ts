
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

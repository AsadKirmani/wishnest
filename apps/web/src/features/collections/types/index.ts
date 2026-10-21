
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

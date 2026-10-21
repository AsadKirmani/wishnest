export type Product = {
  id: string;
  url: string;
  title: string;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
};

export type Collection = {
  id: string;
  name: string;
  description: string | null;
  visibility: "private" | "public";
};

export type SaveProductInput = {
  url: string;
  collectionId: string;
  title?: string;
  imageUrl?: string | null;
  price?: number | null;
  currency?: string | null;
};
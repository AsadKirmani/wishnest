
export interface ProductDraft {
  url: string;
  title: string;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
}

export interface ProductSaveInput extends ProductDraft {
  collectionId: string;
  note?: string | null;
}

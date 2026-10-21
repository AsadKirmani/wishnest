import { createProductRepository, type SaveProductInput as SharedSaveProductInput } from "@wishnest/shared";
import { supabase } from "../../../lib/supabase";
import type { ProductDraft } from "../types";

export interface SaveProductInput extends ProductDraft {
  collectionId: string;
  note?: string | null;
}

const repository = createProductRepository(supabase);

export const productRepository = {
  getByCollection: repository.getByCollection,
  removeFromCollection: repository.removeFromCollection,
  save(input: SaveProductInput): Promise<import("@wishnest/shared").Product> {
    const sharedInput: SharedSaveProductInput = {
      collectionId: input.collectionId,
      url: input.url,
      title: input.title,
      imageUrl: input.imageUrl,
      price: input.price,
      currency: input.currency,
      note: input.note,
    };
    return repository.save(sharedInput);
  },
};

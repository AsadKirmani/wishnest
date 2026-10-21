
import {
  createCollectionRepository,
} from "@wishnest/shared";
import type {
  CreateCollectionInput,
} from "@wishnest/shared";
import { supabase } from "../../../lib/supabase";

const repository = createCollectionRepository(supabase);

export const collectionRepository = {
  getById: repository.getById,

  create: (input: CreateCollectionInput) =>
    repository.create(input),

  getAll: async () => {
    const collections = await repository.getAll();

    return collections.map(
      ({ id, name, description, visibility }) => ({
        id,
        name,
        description,
        visibility,
      }),
    );
  },
};

export type UserCollection = Awaited<
  ReturnType<typeof collectionRepository.getAll>
>[number];

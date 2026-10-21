
import { supabase } from "../../../lib/supabase";
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "../types";

const COLLECTIONS_TABLE = "collections";

export const collectionRepository = {
  async getAll(): Promise<Collection[]> {
    const { data, error } = await supabase
      .from(COLLECTIONS_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as Collection[];
  },


async create(input: CreateCollectionInput): Promise<Collection> {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("You must be logged in to create a collection.");
  }

  const { data, error } = await supabase
    .from(COLLECTIONS_TABLE)
    .insert({
      owner_id: userData.user.id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      visibility: input.visibility ?? "private",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Collection;
},


  async update(
    id: string,
    input: UpdateCollectionInput,
  ): Promise<Collection> {
    const updates: UpdateCollectionInput = {};

    if (input.name !== undefined) {
      updates.name = input.name.trim();
    }

    if (input.description !== undefined) {
      updates.description = input.description?.trim() || null;
    }

    if (input.visibility !== undefined) {
      updates.visibility = input.visibility;
    }

    const { data, error } = await supabase
      .from(COLLECTIONS_TABLE)
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Collection;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(COLLECTIONS_TABLE)
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },
};

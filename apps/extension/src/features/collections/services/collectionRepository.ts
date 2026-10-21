
import { supabase } from "../../../lib/supabase";

export interface UserCollection {
  id: string;
  name: string;
  description: string | null;
  visibility: "private" | "public";
}

export const collectionRepository = {
  async getAll(): Promise<UserCollection[]> {
    const { data, error } = await supabase
      .from("collections")
      .select("id, name, description, visibility")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as UserCollection[];
  },
};

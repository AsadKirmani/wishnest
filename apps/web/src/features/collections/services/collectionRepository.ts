import { createCollectionRepository } from "@wishnest/shared";
import { supabase } from "../../../lib/supabase";

export const collectionRepository = createCollectionRepository(supabase);

import { createProductRepository } from "@wishnest/shared";
import { supabase } from "../../../lib/supabase";

export const productRepository = createProductRepository(supabase);

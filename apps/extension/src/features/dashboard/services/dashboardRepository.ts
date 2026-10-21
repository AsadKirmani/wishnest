import { createDashboardRepository } from "@wishnest/shared";
import { supabase } from "../../../lib/supabase";

export type { DashboardCollection, DashboardData, RecentProduct } from "@wishnest/shared";

export const dashboardRepository = createDashboardRepository(supabase);

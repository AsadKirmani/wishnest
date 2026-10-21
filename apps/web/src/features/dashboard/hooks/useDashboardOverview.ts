import { useCallback, useEffect, useState } from "react";
import { createDashboardRepository, type RecentProduct } from "@wishnest/shared";
import { supabase } from "../../../lib/supabase";

const dashboardRepository = createDashboardRepository(supabase);

export function useDashboardOverview() {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dashboardRepository.getData();
      setRecentProducts(data.recentProducts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't load recently saved products.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { recentProducts, loading, error, refresh };
}

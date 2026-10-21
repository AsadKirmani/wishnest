
import { useCallback, useEffect, useState } from "react";
import {
  dashboardRepository,
  type DashboardCollection,
  type RecentProduct,
} from "../services/dashboardRepository";

export function useDashboard() {
  const [collections, setCollections] = useState<DashboardCollection[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dashboardRepository.getData();

      setCollections(data.collections);
      setRecentProducts(data.recentProducts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't load your WishNest dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return {
    collections,
    recentProducts,
    loading,
    error,
    refresh: loadDashboard,
  };
}

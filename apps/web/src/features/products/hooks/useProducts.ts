
import { useCallback, useState } from "react";
import { productRepository } from "../services/productRepository";
import type {
  SaveProductInput,
  SavedCollectionProduct,
} from "../types";

interface UseProductsReturn {
  products: SavedCollectionProduct[];
  loading: boolean;
  busy: boolean;
  error: string | null;
  loadProducts: (collectionId: string) => Promise<void>;
  saveProduct: (input: SaveProductInput) => Promise<void>;
  removeProduct: (
    collectionId: string,
    productId: string,
  ) => Promise<void>;
  clearError: () => void;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<SavedCollectionProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async (collectionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await productRepository.getByCollection(collectionId);
      setProducts(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load products.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProduct = async (input: SaveProductInput) => {
    setBusy(true);
    setError(null);

    try {
      await productRepository.save(input);
      await loadProducts(input.collectionId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save product.";

      setError(message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const removeProduct = async (
    collectionId: string,
    productId: string,
  ) => {
    setBusy(true);
    setError(null);

    try {
      await productRepository.removeFromCollection(collectionId, productId);
      setProducts((current) =>
        current.filter((item) => item.product.id !== productId),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove product.";

      setError(message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const clearError = () => setError(null);

  return {
    products,
    loading,
    busy,
    error,
    loadProducts,
    saveProduct,
    removeProduct,
    clearError,
  };
}

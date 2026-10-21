
import { useCallback, useEffect, useState } from "react";
import { collectionRepository } from "../services/collectionRepository";
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "../types";

interface UseCollectionsReturn {
  collections: Collection[];
  loading: boolean;
  busy: boolean;
  error: string | null;
  loadCollections: () => Promise<void>;
  createCollection: (input: CreateCollectionInput) => Promise<Collection>;
  updateCollection: (
    id: string,
    input: UpdateCollectionInput,
  ) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;
  clearError: () => void;
}

export function useCollections(): UseCollectionsReturn {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await collectionRepository.getAll();
      setCollections(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load collections.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  const createCollection = async (
    input: CreateCollectionInput,
  ): Promise<Collection> => {
    setBusy(true);
    setError(null);

    try {
      const created = await collectionRepository.create(input);
      setCollections((current) => [created, ...current]);
      return created;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create collection.";
      setError(message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const updateCollection = async (
    id: string,
    input: UpdateCollectionInput,
  ): Promise<Collection> => {
    setBusy(true);
    setError(null);

    try {
      const updated = await collectionRepository.update(id, input);

      setCollections((current) =>
        current.map((collection) =>
          collection.id === id ? updated : collection,
        ),
      );

      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update collection.";
      setError(message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const deleteCollection = async (id: string): Promise<void> => {
    setBusy(true);
    setError(null);

    try {
      await collectionRepository.delete(id);
      setCollections((current) =>
        current.filter((collection) => collection.id !== id),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete collection.";
      setError(message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const clearError = () => setError(null);

  return {
    collections,
    loading,
    busy,
    error,
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    clearError,
  };
}

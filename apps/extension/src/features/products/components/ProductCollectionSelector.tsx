
import { useEffect, useState, type FormEvent } from "react";
import { collectionRepository } from "../../collections/services/collectionRepository";
import { productRepository } from "../services/productRepository";
import type { ProductDraft } from "../types";
import type { UserCollection } from "../../collections/services/collectionRepository";
import "./ProductCollectionSelector.css";

interface ProductCollectionSelectorProps {
  product: ProductDraft;
  onBack: () => void;
  onSaved: () => void;
}

export default function ProductCollectionSelector({
  product,
  onBack,
  onSaved,
}: ProductCollectionSelectorProps) {
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [collectionId, setCollectionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCollections() {
      setLoading(true);
      setError(null);

      try {
        const result = await collectionRepository.getAll();

        if (!active) return;

        setCollections(result);
        setCollectionId((current) => current || result[0]?.id || "");

        if (result.length === 0) {
          setError(
            "You don't have any collections yet. Create one in the WishNest web app first.",
          );
        }
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Could not load your collections.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCollections();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!collectionId) {
      setError("Choose a collection first.");
      return;
    }

    setBusy(true);

    try {
      await productRepository.save({
        ...product,
        collectionId,
      });

      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save this product.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="collection-selector">
      <button
        type="button"
        className="selector-back"
        onClick={onBack}
        disabled={busy}
      >
        ← Back to product
      </button>

      <h1>Save to WishNest</h1>
      <p className="selector-product-title">{product.title}</p>

      {loading ? (
        <p>Loading your collections...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="target-collection">Choose collection</label>

          <select
            id="target-collection"
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            disabled={busy || collections.length === 0}
          >
            <option value="" disabled>
              Select a collection
            </option>

            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>

          {error && <p className="selector-error" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={busy || !collectionId || collections.length === 0}
          >
            {busy ? "Saving product..." : "Save product"}
          </button>
        </form>
      )}
    </main>
  );
}

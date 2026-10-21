import { useEffect, useState, type FormEvent } from "react";
import { collectionRepository } from "../../collections/services/collectionRepository";
import { productRepository } from "../services/productRepository";
import type { ProductDraft } from "../types";
import type { UserCollection } from "../../collections/services/collectionRepository";

interface ProductCollectionSelectorProps {
  product: ProductDraft;
  onBack: () => void;
  onSaved: () => void;
  initialCollectionId?: string | null;
}

export default function ProductCollectionSelector({
  product,
  onBack,
  onSaved,
  initialCollectionId = null,
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

        const preferredCollectionExists = result.some(
          (collection) => collection.id === initialCollectionId,
        );

        setCollectionId(
          preferredCollectionExists
            ? initialCollectionId!
            : result[0]?.id || "",
        );

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
  }, [initialCollectionId]);

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

  const buttonClasses =
    "cursor-pointer rounded-lg border-0 bg-[#5965d8] px-3 py-[11px] font-semibold text-white transition-colors hover:bg-[#4955c5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5965d8] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="grid gap-3.5 p-5 text-[#172033]">
      <button
        type="button"
        className="justify-self-start cursor-pointer border-0 bg-transparent px-0 py-1 text-left text-[13px] font-medium text-[#4e56ba] hover:text-[#35409f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5965d8] disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onBack}
        disabled={busy}
      >
        ← Back to product
      </button>

      <h1 className="mt-1 mb-0 text-xl font-semibold">
        Save to WishNest
      </h1>

      <p className="m-0 [overflow-wrap:anywhere] text-[13px] leading-[1.5] text-[#647084]">
        {product.title}
      </p>

      {loading ? (
        <div
          className="flex items-center gap-2 py-3 text-[13px] text-[#647084]"
          role="status"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d9deea] border-t-[#5965d8] motion-reduce:animate-none" />
          Loading your collections...
        </div>
      ) : (
        <form
          className="grid gap-3"
          onSubmit={handleSubmit}
        >
          <label
            className="text-[13px] font-semibold text-[#334155]"
            htmlFor="target-collection"
          >
            Choose collection
          </label>

          <select
            className="box-border w-full min-w-0 rounded-lg border border-[#d9deea] bg-white p-2.5 text-[13px] text-[#172033] focus:border-[#5965d8] focus:outline-2 focus:outline-[#c7d2fe] focus:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
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

          {error && (
            <p
              className="m-0 [overflow-wrap:anywhere] text-xs leading-[1.5] text-[#b42332]"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className={buttonClasses}
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
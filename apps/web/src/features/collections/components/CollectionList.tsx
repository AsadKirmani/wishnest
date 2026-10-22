import { useEffect, useState } from "react";
import type { Collection } from "../types";
import { productRepository } from "../../products/services/productRepository";
import type { SavedCollectionProduct } from "../../products/types";
import CollectionCard from "./CollectionCard";

interface CollectionListProps {
  collections: Collection[];
  busy: boolean;
  onView: (collection: Collection) => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
}

export default function CollectionList({
  collections,
  busy,
  onView,
  onEdit,
  onDelete,
}: CollectionListProps) {
  const [productsByCollection, setProductsByCollection] = useState<
    Record<string, SavedCollectionProduct[]>
  >({});

  useEffect(() => {
    let cancelled = false;

    async function loadCollectionProducts() {
      const results = await Promise.all(
        collections.map(async (collection) => {
          try {
            const products = await productRepository.getByCollection(
              collection.id,
            );

            return [collection.id, products] as const;
          } catch {
            return [collection.id, []] as const;
          }
        }),
      );

      if (!cancelled) {
        setProductsByCollection(Object.fromEntries(results));
      }
    }

    if (collections.length > 0) {
      void loadCollectionProducts();
    } else {
      setProductsByCollection({});
    }

    return () => {
      cancelled = true;
    };
  }, [collections]);

  if (collections.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d9deea] px-5 py-[42px] text-center">
        <h3 className="mb-2 text-lg font-semibold">No collections yet</h3>
        <p className="m-0 text-[#647084]">
          Create your first collection to start organizing products.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] items-stretch gap-4">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          busy={busy}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          products={productsByCollection[collection.id] ?? []}
        />
      ))}
    </div>
  );
}
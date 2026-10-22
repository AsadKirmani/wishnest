
import { Ghost } from "lucide-react";
import type { SavedCollectionProduct } from "../types";
import ProductCard from "./ProductCard";

interface ProductListProps {
  products: SavedCollectionProduct[];
  loading: boolean;
  busy: boolean;
  onRemove: (productId: string) => void;
}

export default function ProductList({
  products,
  loading,
  busy,
  onRemove,
}: ProductListProps) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center gap-3 py-10 text-sm text-content-muted"
        role="status"
      >
        <span className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
        Loading products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface px-5 py-10 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-secondary text-primary">
          <Ghost className="size-6" aria-hidden="true" />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-content">
          No products saved yet
        </h3>

        <p className="m-0 text-sm leading-relaxed text-content-muted">
          Add a product URL to start building your wishlist.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 min-[641px]:grid-cols-[repeat(auto-fit,minmax(210px,1fr))] min-[641px]:gap-3.5">
      {products.map((item) => (
        <ProductCard
          key={`${item.item.collection_id}-${item.product.id}`}
          item={item}
          busy={busy}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
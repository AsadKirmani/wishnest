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
        className="flex items-center justify-center gap-3 py-10 text-sm text-[#647084]"
        role="status"
      >
        <span className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#5965d8]" />
        Loading products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d9deea] px-5 py-10 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#f0f1ff] text-[#5965d8]">
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path
              d="M6 3h12l2 5-8 13L4 8l2-5Z"
              strokeLinejoin="round"
            />
            <path d="M4 8h16M9 3l3 18 3-18M6 3l3 5m9-5-3 5" />
          </svg>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-[#172033]">
          No products saved yet
        </h3>

        <p className="m-0 text-sm leading-relaxed text-[#647084]">
          Add a product URL to start building your wishlist.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-[18px]">
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

import { useState } from "react";
import type { Collection } from "../types";
import type { SavedCollectionProduct } from "../../products/types";
import { Ellipsis } from "lucide-react";

interface CollectionCardProps {
  collection: Collection;
  onView: (collection: Collection) => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  products: SavedCollectionProduct[];
  busy: boolean;
}

export default function CollectionCard({
  collection,
  onView,
  onEdit,
  onDelete,
  products,
  busy,
}: CollectionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const recentProducts = products.slice(0, 3);

  return (
    <article className="group min-w-0 overflow-visible rounded-2xl border border-border bg-surface text-content transition-shadow hover:shadow-md">
      <div className="relative">
        <button
          type="button"
          onClick={() => onView(collection)}
          disabled={busy}
          aria-label={`Open ${collection.name}`}
          className="relative block aspect-[16/9] w-full overflow-hidden rounded-t-2xl bg-secondary disabled:cursor-not-allowed"
        >
          {recentProducts.length > 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              {recentProducts.map(({ product, item }, index) => (
                <div
                  key={`${item.collection_id}-${product.id}`}
                  className="absolute h-[70%] w-[30%] overflow-hidden rounded-xl border-2 border-white bg-surface shadow-md transition-transform duration-300 group-hover:scale-[1.03]"
                  style={{
                    left: `${50 + (index - (recentProducts.length - 1) / 2) * 23}%`,
                    transform: `translateX(-50%) rotate(${(index - (recentProducts.length - 1) / 2) * 7}deg)`,
                    zIndex: index + 1,
                  }}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-content-muted">
                      No image
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-sm text-content-muted">
              No products yet
            </div>
          )}

          <span className="absolute bottom-3 left-3 z-10 rounded-full border border-white/30 bg-primary/80 px-3 py-1.5 text-xs font-semibold text-on-primary backdrop-blur-sm">
            {products.length}{" "}
            {products.length === 1 ? "product" : "products"}
          </span>
        </button>

        <div className="absolute right-3 top-3 z-20">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full border border-border bg-surface/30 text-content shadow-sm backdrop-blur-sm transition hover:bg-secondary disabled:opacity-60"
            aria-label={`Actions for ${collection.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            disabled={busy}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Ellipsis className="size-4" aria-hidden="true" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-[calc(100%+6px)] flex min-w-[160px] flex-col rounded-xl border border-border bg-surface/95 p-1 text-content shadow-lg backdrop-blur-sm"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                className="rounded-lg px-3 py-2.5 text-left text-sm hover:bg-secondary disabled:opacity-60"
                disabled={busy}
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(collection);
                }}
              >
                Edit collection
              </button>

              <button
                type="button"
                role="menuitem"
                className="rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                disabled={busy}
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(collection);
                }}
              >
                Delete collection
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onView(collection)}
        disabled={busy}
        className="block w-full min-w-0 rounded-b-2xl p-4 text-left disabled:cursor-not-allowed"
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <h3 className="m-0 min-w-0 flex-1 break-words text-lg font-semibold leading-6 text-content">
            {collection.name}
          </h3>

          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-content">
            {collection.visibility === "private" ? "Private" : "Public"}
          </span>
        </div>

        {collection.description?.trim() && (
          <p className="mb-0 mt-2 line-clamp-2 break-words text-sm leading-5 text-content-muted">
            {collection.description}
          </p>
        )}

        <p className="mb-0 mt-3 text-xs text-content-muted">
          Created {new Date(collection.created_at).toLocaleDateString()}
        </p>
      </button>
    </article>
  );
}
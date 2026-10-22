
import { useState } from "react";
import type { Collection } from "../types";
import type { SavedCollectionProduct } from "../../products/types";

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
    <article className="group min-w-0 overflow-visible rounded-2xl border border-[#e3e7ef] bg-white transition-shadow hover:shadow-md">
      {/* Image collage */}
      <div className="relative">
        <button
          type="button"
          onClick={() => onView(collection)}
          disabled={busy}
          aria-label={`Open ${collection.name}`}
          className="relative block aspect-[16/9] w-full overflow-hidden rounded-t-2xl bg-[#f1f3f8] disabled:cursor-not-allowed"
        >
          {recentProducts.length > 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              {recentProducts.map(({ product, item }, index) => (
                <div
                  key={`${item.collection_id}-${product.id}`}
                  className="absolute h-[78%] w-[31%] overflow-hidden rounded-xl border-2 border-white bg-white shadow-md transition-transform duration-300 group-hover:scale-[1.03]"
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
                    <div className="grid h-full place-items-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-sm text-[#647084]">
              No products yet
            </div>
          )}

          {/* Product count overlay */}
          <span className="absolute bottom-3 left-3 z-10 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold text-white">
            {products.length}{" "}
            {products.length === 1 ? "product" : "products"}
          </span>
        </button>

        {/* Actions menu over the image */}
        <div className="absolute right-3 top-3 z-20">
          <button
            type="button"
            className="grid backdrop-blur-sm size-9 place-items-center rounded-full border border-white/70 text-[#172033] shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-60"
            aria-label={`Actions for ${collection.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            disabled={busy}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="5" cy="12" r="1.7" />
              <circle cx="12" cy="12" r="1.7" />
              <circle cx="19" cy="12" r="1.7" />
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-[calc(100%+6px)] flex min-w-[160px] flex-col rounded-xl border-1 border-slate-200 bg-white/90 backdrop-blur-sm p-1 shadow-lg"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                className="rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-100 disabled:opacity-60"
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

      {/* Collection information */}
      <button
        type="button"
        onClick={() => onView(collection)}
        disabled={busy}
        className="block w-full min-w-0 rounded-b-2xl p-4 text-left disabled:cursor-not-allowed"
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <h3 className="m-0 min-w-0 flex-1 break-words text-lg font-semibold leading-6 text-[#172033]">
            {collection.name}
          </h3>

          <span className="shrink-0 rounded-full bg-[#f0f1ff] px-2.5 py-1 text-xs font-semibold text-[#4e56ba]">
            {collection.visibility === "private" ? "Private" : "Public"}
          </span>
        </div>

        {collection.description?.trim() && (
          <p className="mb-0 mt-2 line-clamp-2 break-words text-sm leading-5 text-[#647084]">
            {collection.description}
          </p>
        )}

        <p className="mb-0 mt-3 text-xs text-[#647084]">
          Created {new Date(collection.created_at).toLocaleDateString()}
        </p>
      </button>
    </article>
  );
}

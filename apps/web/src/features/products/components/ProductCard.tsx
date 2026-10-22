import type { SavedCollectionProduct } from "../types";

interface ProductCardProps {
  item: SavedCollectionProduct;
  busy: boolean;
  onRemove: (productId: string) => void;
}

export default function ProductCard({
  item,
  busy,
  onRemove,
}: ProductCardProps) {
  const { product, item: collectionItem } = item;

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-[#e3e7ef] bg-white transition-shadow hover:shadow-md">
      {product.image_url ? (
        <img
          className="box-border block h-[210px] w-full bg-[#f1f3f8] object-contain"
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      ) : (
        <div
          className="grid h-[210px] w-full place-items-center bg-[#f1f3f8] text-[13px] text-[#626b7f]"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="size-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            No image
          </div>
        </div>
      )}

      <div className="grid content-start gap-3 p-[18px]">
        <h3 className="m-0 line-clamp-2 min-h-[3rem] break-words text-base font-semibold leading-6">
          <a
            className="text-[#26358a] no-underline hover:underline"
            href={product.canonical_url}
            target="_blank"
            rel="noreferrer"
            title={product.title}
          >
            {product.title}
          </a>
        </h3>

        {product.current_price !== null && (
          <p className="m-0 text-lg font-bold text-[#172033]">
            {product.currency ?? ""}{" "}
            {product.current_price.toLocaleString()}
          </p>
        )}

        {collectionItem.note && (
          <p className="m-0 break-words text-[13px] leading-[1.6] text-[#647084]">
            {collectionItem.note}
          </p>
        )}

        <p className="m-0 break-words text-[13px] leading-[1.6] text-[#647084]">
          Saved {new Date(collectionItem.added_at).toLocaleDateString()}
        </p>

        <button
          type="button"
          className="mt-1 w-full rounded-[9px] bg-[#fff0f0] px-3 py-[10px] text-sm font-semibold text-[#b42332] transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy}
          onClick={() => onRemove(product.id)}
        >
          {busy ? "Please wait..." : "Remove from collection"}
        </button>
      </div>
    </article>
  );
}
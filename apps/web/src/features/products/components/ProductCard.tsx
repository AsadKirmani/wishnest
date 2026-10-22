
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

  function formatPrice(price: number, currency: string | null): string {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency || "INR",
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      return `${currency ?? ""} ${price}`.trim();
    }
  }

  return (
    <article className="min-w-0 overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
      <a
        className="grid h-[120px] w-full place-items-center overflow-hidden bg-secondary text-[32px] text-content-muted no-underline min-[641px]:h-[280px]"
        href={product.canonical_url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${product.title}`}
      >
        {product.image_url ? (
          <img
            className="h-full w-full object-contain"
            src={product.image_url}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        ) : (
          <span aria-hidden="true">♡</span>
        )}
      </a>

      <div className="flex min-w-0 flex-col items-start gap-2 p-[11px] min-[641px]:p-3.5">
        <a
          className="line-clamp-2 max-w-full [overflow-wrap:anywhere] text-sm font-semibold leading-[1.45] text-content no-underline transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          href={product.canonical_url}
          target="_blank"
          rel="noreferrer"
          title={product.title}
        >
          {product.title}
        </a>

        {product.current_price !== null && (
          <strong className="text-sm text-content">
            {formatPrice(product.current_price, product.currency)}
          </strong>
        )}

        {collectionItem.note && (
          <p className="m-0 line-clamp-2 w-full break-words text-xs leading-relaxed text-content-muted">
            {collectionItem.note}
          </p>
        )}

        <p className="m-0 text-xs text-content-muted">
          Saved {new Date(collectionItem.added_at).toLocaleDateString()}
        </p>

        <button
          type="button"
          className="mt-1 w-full cursor-pointer rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-content transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy}
          onClick={() => onRemove(product.id)}
        >
          {busy ? "Please wait..." : "Remove from collection"}
        </button>
      </div>
    </article>
  );
}


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
    <article className="product-card">
      {product.image_url ? (
        <img
          className="product-image"
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      ) : (
        <div className="product-image-placeholder" aria-hidden="true">
          No image
        </div>
      )}

      <div className="product-card-content">
        <h3>
          <a href={product.canonical_url} target="_blank" rel="noreferrer">
            {product.title}
          </a>
        </h3>

        {product.current_price !== null && (
          <p className="product-price">
            {product.currency ?? ""}{" "}
            {product.current_price.toLocaleString()}
          </p>
        )}

        {collectionItem.note && (
          <p className="product-note">{collectionItem.note}</p>
        )}

        <p className="product-saved-date">
          Saved {new Date(collectionItem.added_at).toLocaleDateString()}
        </p>

        <button
          type="button"
          className="button-danger"
          disabled={busy}
          onClick={() => onRemove(product.id)}
        >
          Remove from collection
        </button>
      </div>
    </article>
  );
}

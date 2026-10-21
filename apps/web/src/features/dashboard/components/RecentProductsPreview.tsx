import type { RecentProduct } from "@wishnest/shared";
import "./RecentProductsPreview.css";

type RecentProductsPreviewProps = {
  products: RecentProduct[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenCollection: (collectionId: string) => void;
};

function formatPrice(price: number | null, currency: string | null): string | null {
  if (price === null) return null;

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

export default function RecentProductsPreview({
  products,
  loading,
  error,
  onRetry,
  onOpenCollection,
}: RecentProductsPreviewProps) {
  return (
    <section className="recent-products-preview" aria-busy={loading}>
      <header className="recent-products-heading">
        <div>
          <p className="page-eyebrow">YOUR LATEST FINDS</p>
          <h2>Recently added</h2>
          <p>Quickly get back to something you saved.</p>
        </div>
      </header>

      {error && (
        <div className="recent-products-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={onRetry}>Try again</button>
        </div>
      )}

      {loading ? (
        <p className="recent-products-status" role="status">Loading recent products...</p>
      ) : !error && products.length === 0 ? (
        <div className="recent-products-empty">
          <span className="recent-products-empty-icon" aria-hidden="true">♡</span>
          <h3>No products saved yet</h3>
          <p>Products you add to your collections will show up here for quick access.</p>
        </div>
      ) : (
        <div className="recent-products-grid">
          {products.map((product) => (
            <article className="recent-product-card" key={`${product.collectionId}-${product.id}`}>
              <a
                className="recent-product-image"
                href={product.canonical_url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${product.title}`}
              >
                {product.image_url ? (
                  <img src={product.image_url} alt="" loading="lazy" />
                ) : (
                  <span aria-hidden="true">♡</span>
                )}
              </a>
              <div className="recent-product-details">
                <a
                  className="recent-product-title"
                  href={product.canonical_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {product.title}
                </a>
                <button
                  className="recent-product-collection"
                  type="button"
                  onClick={() => onOpenCollection(product.collectionId)}
                >
                  {product.collectionName}
                </button>
                <strong className="recent-product-price">
                  {formatPrice(product.current_price, product.currency) ?? "Price unavailable"}
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

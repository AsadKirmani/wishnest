
import { useCallback, useEffect, useState } from "react";
import {
  dashboardRepository,
  type RecentProduct,
} from "../services/dashboardRepository";
import "./CollectionDetail.css";

type CollectionDetailProps = {
  collectionId: string;
  onBack: () => void;
};

function formatPrice(
  price: number | null,
  currency: string | null,
): string | null {
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

export default function CollectionDetail({
  collectionId,
  onBack,
}: CollectionDetailProps) {
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [collectionName, setCollectionName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result =
        await dashboardRepository.getCollectionProducts(collectionId);

      setProducts(result);
      setCollectionName(result[0]?.collectionName ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't load this collection.",
      );
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return (
    <main className="collection-detail">
      <header className="collection-detail-header">
        <button
          className="collection-back-button"
          type="button"
          onClick={onBack}
        >
          <span aria-hidden="true">←</span> Dashboard
        </button>

        <span className="collection-detail-brand">WishNest</span>
      </header>

      <section className="collection-detail-heading">
        <div className="collection-detail-icon" aria-hidden="true">
          ♡
        </div>

        <div>
          <h1>{collectionName || "Collection"}</h1>
          <p>
            {loading
              ? "Loading saved products..."
              : `${products.length} ${
                  products.length === 1 ? "product" : "products"
                } saved`}
          </p>
        </div>
      </section>

      {error && (
        <div className="collection-detail-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => void loadProducts()}>
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="collection-detail-loading" role="status">
          <span className="collection-detail-spinner" />
          <p>Loading your products...</p>
        </div>
      ) : !error && products.length === 0 ? (
        <section className="collection-detail-empty">
          <div className="collection-detail-empty-icon">＋</div>
          <h2>This collection is waiting for its first find</h2>
          <p>
            When you discover something you love, capture it from a
            shopping page and save it to this collection.
          </p>
          <button type="button" onClick={onBack}>
            Back to dashboard
          </button>
        </section>
      ) : (
        <section className="collection-detail-products">
          {products.map((product) => (
            <article
              className="collection-detail-product"
              key={product.id}
            >
              <button
                className="collection-detail-image"
                type="button"
                onClick={() =>
                  window.open(
                    product.canonical_url,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                aria-label={`Open ${product.title}`}
              >
                {product.image_url ? (
                  <img src={product.image_url} alt="" loading="lazy" />
                ) : (
                  <span aria-hidden="true">♡</span>
                )}
              </button>

              <div className="collection-detail-product-info">
                <button
                  className="collection-detail-product-title"
                  type="button"
                  onClick={() =>
                    window.open(
                      product.canonical_url,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  {product.title}
                </button>

                <strong className="collection-detail-price">
                  {formatPrice(product.current_price, product.currency) ??
                    "Price unavailable"}
                </strong>

                <span className="collection-detail-date">
                  Added{" "}
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(product.addedAt))}
                </span>
              </div>

              <button
                className="collection-detail-open"
                type="button"
                onClick={() =>
                  window.open(
                    product.canonical_url,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                aria-label={`Visit ${product.title}`}
                title="Open product page"
              >
                ↗
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}


import { useCallback, useEffect, useState } from "react";
import { collectionRepository } from "../../collections/services/collectionRepository";
import { productRepository } from "../../products/services/productRepository";
import type { SavedCollectionProduct } from "@wishnest/shared";
import "./CollectionDetail.css";

type CollectionDetailProps = {
  collectionId: string;
  onBack: () => void;
  onCaptureProduct: () => void;
  captureBusy: boolean;
  captureError: string | null;
  saveMessage: string | null;
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
  onCaptureProduct,
  captureBusy,
  captureError,
  saveMessage,
}: CollectionDetailProps) {
  const [products, setProducts] = useState<SavedCollectionProduct[]>([]);
  const [collectionName, setCollectionName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingProductId, setRemovingProductId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [collection, result] = await Promise.all([
        collectionRepository.getById(collectionId),
        productRepository.getByCollection(collectionId),
      ]);

      setProducts(result);
      setCollectionName(collection.name);
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

  async function handleRemove(productId: string) {
    const confirmed = window.confirm(
      "Remove this product from the collection? The product record will not be deleted.",
    );
    if (!confirmed) return;

    setError(null);
    setRemovingProductId(productId);

    try {
      await productRepository.removeFromCollection(collectionId, productId);
      setProducts((current) =>
        current.filter((item) => item.product.id !== productId),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not remove this product.",
      );
    } finally {
      setRemovingProductId(null);
    }
  }

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

        <div className="collection-detail-header-actions">
          <button
            className="collection-detail-capture"
            type="button"
            onClick={onCaptureProduct}
            disabled={captureBusy}
          >
            {captureBusy ? "Detecting..." : "+ Capture product"}
          </button>
          <span className="collection-detail-brand">WishNest</span>
        </div>
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

      {saveMessage && (
        <div className="collection-detail-success" role="status">
          {saveMessage}
        </div>
      )}

      {captureError && (
        <div className="collection-detail-error" role="alert">
          <p>{captureError}</p>
        </div>
      )}

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
      ) : error ? null : products.length === 0 ? (
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
              key={product.item.product_id}
            >
              <button
                className="collection-detail-image"
                type="button"
                onClick={() =>
                  window.open(
                    product.product.canonical_url,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                aria-label={`Open ${product.product.title}`}
              >
                {product.product.image_url ? (
                  <img src={product.product.image_url} alt="" loading="lazy" />
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
                      product.product.canonical_url,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  {product.product.title}
                </button>

                <strong className="collection-detail-price">
                  {formatPrice(product.product.current_price, product.product.currency) ??
                    "Price unavailable"}
                </strong>

                <span className="collection-detail-date">
                  Added{" "}
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(product.item.added_at))}
                </span>
              </div>

              <div className="collection-detail-product-actions">
                <button
                  className="collection-detail-open"
                  type="button"
                  onClick={() =>
                    window.open(
                      product.product.canonical_url,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  aria-label={`Visit ${product.product.title}`}
                  title="Open product page"
                >
                  ↗
                </button>
                <button
                  className="collection-detail-remove"
                  type="button"
                  onClick={() => void handleRemove(product.product.id)}
                  disabled={removingProductId === product.product.id}
                >
                  {removingProductId === product.product.id ? "Removing..." : "Remove"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

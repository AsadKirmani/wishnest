
import { useDashboard } from "../hooks/useDashboard";
import "./Dashboard.css";

type DashboardProps = {
  email: string;
  onCaptureProduct: () => void;
  captureBusy: boolean;
  onLogout: () => void;
  onOpenCollection: (collectionId: string) => void;
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

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export default function Dashboard({
  email,
  onCaptureProduct,
  captureBusy,
  onLogout,
  onOpenCollection,
}: DashboardProps) {
  const {
    collections,
    recentProducts,
    loading,
    error,
    refresh,
  } = useDashboard();

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="dashboard-logo" aria-hidden="true">
            W
          </div>
          <div>
            <h1>WishNest</h1>
            <p>Your wishlist, in one place.</p>
          </div>
        </div>

        <button
          className="dashboard-logout"
          type="button"
          onClick={onLogout}
          aria-label={`Log out ${email}`}
          title={`Logged in as ${email}`}
        >
          Log out
        </button>
      </header>

      <section className="dashboard-welcome">
        <div>
          <h2>Your wishlist</h2>
          <p>Keep the things you love, all in one place.</p>
        </div>

        <button
          className="dashboard-capture"
          type="button"
          onClick={onCaptureProduct}
          disabled={captureBusy}
        >
          {captureBusy ? "Detecting..." : "+ Capture product"}
        </button>
      </section>

      {error && (
        <div className="dashboard-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => void refresh()}>
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading" role="status">
          <span className="dashboard-spinner" />
          <p>Loading your wishlist...</p>
        </div>
      ) : (
        <>
          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>My collections</h2>
                <p>Organize your saved finds.</p>
              </div>
              <span className="dashboard-count">
                {collections.length}
              </span>
            </div>

            {collections.length === 0 ? (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">♡</div>
                <h3>Your collections will live here</h3>
                <p>
                  Create your first collection on WishNest web, then
                  it will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="dashboard-collections">
                {collections.map((collection) => (
                  <button
                    className="dashboard-collection"
                    type="button"
                    key={collection.id}
                    onClick={() => onOpenCollection(collection.id)}
                  >
                    <span className="dashboard-collection-icon">
                      ♡
                    </span>
                    <span className="dashboard-collection-info">
                      <strong>{collection.name}</strong>
                      <span>
                        {collection.productCount}{" "}
                        {collection.productCount === 1
                          ? "product"
                          : "products"}
                      </span>
                    </span>
                    <span className="dashboard-chevron">›</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>Recently added</h2>
                <p>Your latest saved finds.</p>
              </div>
            </div>

            {recentProducts.length === 0 ? (
              <div className="dashboard-empty dashboard-empty-compact">
                <div className="dashboard-empty-icon">＋</div>
                <h3>Nothing saved just yet</h3>
                <p>
                  Find something you like on a shopping site and
                  capture it to see it here.
                </p>
                <button
                  className="dashboard-text-button"
                  type="button"
                  onClick={onCaptureProduct}
                  disabled={captureBusy}
                >
                  {captureBusy ? "Detecting..." : "Save your first product"}
                </button>
              </div>
            ) : (
              <div className="dashboard-recent-list">
                {recentProducts.map((product) => (
                  <article
                    className="dashboard-product"
                    key={`${product.collectionId}-${product.id}`}
                  >
                    <button
                      className="dashboard-product-image"
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
                        <img
                          src={product.image_url}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <span className="dashboard-image-placeholder">
                          ♡
                        </span>
                      )}
                    </button>

                    <div className="dashboard-product-info">
                      <button
                        className="dashboard-product-title"
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
                      <button
                        className="dashboard-product-collection"
                        type="button"
                        onClick={() =>
                          onOpenCollection(product.collectionId)
                        }
                      >
                        {product.collectionName}
                      </button>
                      <div className="dashboard-product-meta">
                        <strong>
                          {formatPrice(
                            product.current_price,
                            product.currency,
                          ) ?? "Price unavailable"}
                        </strong>
                        <span>{formatDate(product.addedAt)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

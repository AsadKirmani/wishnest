
import { useEffect, useState } from "react";
import { useProducts } from "../../products/hooks/useProducts";
import ProductForm from "../../products/components/ProductForm";
import ProductList from "../../products/components/ProductList";
import type { Collection } from "../types";
import "./CollectionDetailPage.css";

interface CollectionDetailPageProps {
  collection: Collection;
  onBack: () => void;
}

export default function CollectionDetailPage({
  collection,
  onBack,
}: CollectionDetailPageProps) {
  const {
    products,
    loading,
    busy,
    error,
    loadProducts,
    saveProduct,
    removeProduct,
    clearError,
  } = useProducts();

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    void loadProducts(collection.id);
  }, [collection.id, loadProducts]);

  async function handleRemove(productId: string) {
    const confirmed = window.confirm(
      "Remove this product from the collection? The product record will not be deleted.",
    );

    if (!confirmed) return;

    try {
      await removeProduct(collection.id, productId);
    } catch {
      // The hook exposes the error for display.
    }
  }

  return (
    <main className="collection-detail-page">
      <button
        type="button"
        className="button-secondary"
        onClick={onBack}
      >
        ← All collections
      </button>

      <header className="collection-detail-header">
        <div>
          <span className="collection-visibility">
            {collection.visibility === "private" ? "Private" : "Public"}
          </span>
          <h1>{collection.name}</h1>
          <p>
            {collection.description || "Your saved products in one place."}
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => {
              clearError();
              setShowForm(true);
            }}
          >
            + Add product
          </button>
        )}
      </header>

      {error && (
        <div className="collections-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <section className="product-editor">
          <h2>Add a product</h2>

          <ProductForm
            collections={[collection]}
            initialCollectionId={collection.id}
            busy={busy}
            onSubmit={async (input) => {
              await saveProduct(input);
              setShowForm(false);
            }}
            onCancel={() => {
              setShowForm(false);
              clearError();
            }}
          />
        </section>
      )}

      <section className="collection-products">
        <h2>Saved products ({products.length})</h2>

        <ProductList
          products={products}
          loading={loading}
          busy={busy}
          onRemove={(productId) => void handleRemove(productId)}
        />
      </section>
    </main>
  );
}

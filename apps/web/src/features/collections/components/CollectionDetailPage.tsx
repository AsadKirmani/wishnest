import { useEffect, useState } from "react";
import { useProducts } from "../../products/hooks/useProducts";
import ProductForm from "../../products/components/ProductForm";
import ProductList from "../../products/components/ProductList";
import type { Collection } from "../types";

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
    <main className="mx-auto w-[min(100%-2rem,1100px)] pb-16 pt-8 text-[#172033]">
      <button
        type="button"
        className="button-secondary"
        onClick={onBack}
      >
        ← All collections
      </button>

      <header className="my-7 flex items-start justify-between gap-6 max-[600px]:flex-col">
        <div className="min-w-0">
          <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {collection.visibility === "private" ? "Private" : "Public"}
          </span>

          <h1 className="my-3 break-words text-[clamp(28px,4vw,38px)] font-bold tracking-[-0.04em]">
            {collection.name}
          </h1>

          <p className="break-words leading-[1.6] text-[#647084]">
            {collection.description || "Your saved products in one place."}
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            className="shrink-0 max-[600px]:w-full"
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
        <div
          className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <p className="min-w-0 break-words">{error}</p>

          <button
            type="button"
            className="shrink-0 font-medium underline"
            onClick={clearError}
          >
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <section className="mb-8 max-w-[640px] rounded-2xl border border-[#e3e7ef] bg-white p-[22px] max-[380px]:p-4">
          <h2 className="mb-5 text-[21px] font-semibold">
            Add a product
          </h2>

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

      <section>
        <h2 className="mb-5 text-[21px] font-semibold">
          Saved products ({products.length})
        </h2>

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
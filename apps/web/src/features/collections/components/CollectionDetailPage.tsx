import { useEffect, useState } from "react";
import { useProducts } from "../../products/hooks/useProducts";
import ProductForm from "../../products/components/ProductForm";
import ProductList from "../../products/components/ProductList";
import type { Collection } from "../types";
import { useModal } from "../../../shared/components/ModalContext";
import DeleteDialog from "../../../shared/components/DeleteDialog";

interface CollectionDetailPageProps {
  collection: Collection;
  onBack: () => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  busy?: boolean;
}

export default function CollectionDetailPage({
  collection,
  onBack,
  onEdit,
  onDelete,
  busy = false,
}: CollectionDetailPageProps) {
  const { openModal, closeModal } = useModal();

  const {
    products,
    loading,
    busy: productBusy,
    error,
    loadProducts,
    saveProduct,
    removeProduct,
    clearError,
  } = useProducts();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    void loadProducts(collection.id);
  }, [collection.id, loadProducts]);

  function handleAddProduct() {
    clearError();

    openModal(
      <div className="pr-5">
        <h2 className="mb-5 text-[21px] font-semibold text-[#172033]">
          Add a product
        </h2>

        <ProductForm
          collections={[collection]}
          initialCollectionId={collection.id}
          busy={productBusy}
          onSubmit={async (input) => {
            await saveProduct(input);
            closeModal();
          }}
          onCancel={() => {
            clearError();
            closeModal();
          }}
        />
      </div>,
      {
        title: "Add a product",
        maxWidth: "max-w-[640px]",
      },
    );
  }

  async function handleRemove(productId: string) {
    openModal(
      <DeleteDialog
        title="Remove product?"
        description="This product will be removed from this collection, but the product record itself will not be deleted."
        confirmText="Remove product"
        busy={productBusy}
        onConfirm={async () => {
          await removeProduct(collection.id, productId);
          closeModal();
        }}
        onCancel={closeModal}
      />,
      {
        title: "Remove product",
        maxWidth: "max-w-[440px]",
      },
    );
  }

  return (
    <main className="mx-auto w-[min(100%-2rem,1100px)] pb-16 pt-8 text-[#172033]">
      <button type="button" className="button-secondary" onClick={onBack}>
        ← All collections
      </button>

      <header className="my-7 flex items-start justify-between gap-6 max-[600px]:flex-col">
        <div className="min-w-0">
          <span className="inline-block rounded-full bg-[#f0f1ff] px-3 py-1 text-xs font-semibold text-[#4e56ba]">
            {collection.visibility === "private" ? "Private" : "Public"}
          </span>

          <h1 className="my-3 break-words text-[clamp(28px,4vw,38px)] font-bold tracking-[-0.04em]">
            {collection.name}
          </h1>

          {collection.description?.trim() && (
            <p className="max-w-2xl whitespace-pre-wrap break-words leading-[1.7] text-[#647084]">
              {collection.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 max-[600px]:w-full">
          <button
            type="button"
            className="rounded-[9px] bg-[#5965d8] px-4 py-[11px] font-semibold text-white max-[600px]:flex-1"
            onClick={handleAddProduct}
          >
            + Add product
          </button>

          <div className="relative">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-lg border border-[#e3e7ef] bg-white hover:bg-slate-50 disabled:opacity-60"
              aria-label="Collection actions"
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
                className="absolute right-0 top-[calc(100%+4px)] z-30 flex min-w-[160px] flex-col rounded-[10px] border border-slate-200 bg-white p-[5px] shadow-[0_8px_24px_rgb(15_23_42_/_12%)]"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="rounded-md px-3 py-2.5 text-left text-sm hover:bg-slate-100"
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
                  className="rounded-md px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
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

      <section>
        <h2 className="mb-5 text-[21px] font-semibold">
          Saved products ({products.length})
        </h2>

        <ProductList
          products={products}
          loading={loading}
          busy={productBusy}
          onRemove={(productId) => void handleRemove(productId)}
        />
      </section>
    </main>
  );
}

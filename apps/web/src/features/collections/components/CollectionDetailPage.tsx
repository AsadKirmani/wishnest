import { useEffect, useState } from "react";
import { useProducts } from "../../products/hooks/useProducts";
import ProductForm from "../../products/components/ProductForm";
import ProductList from "../../products/components/ProductList";
import type { Collection } from "../types";
import { useModal } from "../../../shared/components/ModalContext";
import DeleteDialog from "../../../shared/components/DeleteDialog";
import { Ellipsis, MoveLeft, Plus, Share2, Copy, X } from "lucide-react";
import { supabase } from "../../../lib/supabase";

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

  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareError, setShareError] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  async function handleCreateShareLink() {
    setShareBusy(true);
    setShareError("");
    setShareMessage("");
    setShareUrl("");

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-share-link",
        {
          body: {
            collectionId: collection.id,
            action: "create",
          },
        },
      );

      if (error) throw error;
      if (typeof data?.token !== "string" || !data.token) {
        throw new Error("The server did not return a share token.");
      }

      const url = `${window.location.origin}/share/${encodeURIComponent(data.token)}`;
      setShareUrl(url);

      try {
        await navigator.clipboard.writeText(url);
        setShareMessage("Share link copied to clipboard.");
      } catch {
        setShareMessage("Link generated. Copy it from the field below.");
      }
    } catch (err) {
      setShareError(
        err instanceof Error ? err.message : "Could not create share link.",
      );
    } finally {
      setShareBusy(false);
    }
  }

  async function handleRevokeShareLinks() {
    const confirmed = window.confirm(
      "Revoke all active share links for this collection? Anyone using them will lose access.",
    );

    if (!confirmed) return;

    setShareBusy(true);
    setShareError("");
    setShareMessage("");

    try {
      const { error } = await supabase.functions.invoke("create-share-link", {
        body: {
          collectionId: collection.id,
          action: "revoke",
        },
      });

      if (error) throw error;

      setShareUrl("");
      setShareMessage("All active share links have been revoked.");
    } catch (err) {
      setShareError(
        err instanceof Error ? err.message : "Could not revoke share links.",
      );
    } finally {
      setShareBusy(false);
    }
  }

  useEffect(() => {
    void loadProducts(collection.id);
  }, [collection.id, loadProducts]);

  function handleAddProduct() {
    clearError();

    openModal(
      <div className="pr-5 text-content">
        <h2 className="mb-5 text-[21px] font-semibold">Add a product</h2>

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
    <main className="mx-auto w-[min(100%-2rem,1100px)] pb-16 pt-8 text-content">
      <button
        type="button"
        className="button-secondary flex items-center gap-2"
        onClick={onBack}
      >
        <MoveLeft className="size-4" aria-hidden="true" /> All collections
      </button>

      <header className="my-7 flex items-start justify-between gap-6 max-[600px]:flex-col">
        <div className="min-w-0">
          <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-content">
            {collection.visibility === "private" ? "Private" : "Public"}
          </span>

          <h1 className="my-3 break-words text-[clamp(28px,4vw,38px)] font-bold tracking-[-0.04em]">
            {collection.name}
          </h1>

          {collection.description?.trim() && (
            <p className="max-w-2xl whitespace-pre-wrap break-words leading-[1.7] text-content-muted">
              {collection.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 max-[600px]:w-full">
          <button
            type="button"
            className="rounded-[9px] flex items-center gap-2 justify-center bg-primary px-4 py-[11px] font-semibold text-on-primary max-[600px]:flex-1"
            onClick={handleAddProduct}
          >
            <Plus className="size-4" aria-hidden="true" /> Add product
          </button>

          <div className="relative">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-lg border border-border bg-surface text-content hover:bg-secondary disabled:opacity-60"
              aria-label="Collection actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              disabled={busy}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Ellipsis className="size-4" aria-hidden="true" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-[calc(100%+4px)] z-30 flex min-w-[160px] flex-col rounded-[10px] border border-border bg-surface p-[5px] shadow-lg"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="rounded-md px-3 py-2.5 text-left text-sm text-content hover:bg-secondary"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(collection);
                  }}
                >
                  Edit collection
                </button>

                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setSharePanelOpen(true);
                    setShareError("");
                    setShareMessage("");
                  }}
                  className="rounded-md px-3 py-2.5 text-left text-sm text-content hover:bg-secondary"
                >
                  
                  Share collection
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

      {sharePanelOpen && (
        <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Share collection</h2>
              <p className="mt-1 text-sm text-content-muted">
                Only signed-in WishNest users with a valid link can view this
                collection.
              </p>
            </div>

            <button
              type="button"
              aria-label="Close share panel"
              onClick={() => setSharePanelOpen(false)}
              className="rounded-lg p-2 text-content-muted hover:bg-background"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={shareBusy}
              onClick={() => void handleCreateShareLink()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <Share2 size={16} />
              {shareBusy ? "Please wait..." : "Generate & copy link"}
            </button>

            <button
              type="button"
              disabled={shareBusy}
              onClick={() => void handleRevokeShareLinks()}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              Revoke all links
            </button>
          </div>

          {shareUrl && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                aria-label="Share URL"
                readOnly
                value={shareUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />

              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(shareUrl).then(
                    () => setShareMessage("Share link copied."),
                    () =>
                      setShareMessage(
                        "Clipboard unavailable. Select and copy the link manually.",
                      ),
                  );
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
          )}

          {shareMessage && (
            <p role="status" className="mt-3 text-sm text-content-muted">
              {shareMessage}
            </p>
          )}

          {shareError && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {shareError}
            </p>
          )}
        </section>
      )}

      {error && (
        <div
          className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700"
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

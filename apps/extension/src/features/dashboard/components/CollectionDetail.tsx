import { useCallback, useEffect, useState } from "react";
import { collectionRepository } from "../../collections/services/collectionRepository";
import { productRepository } from "../../products/services/productRepository";
import type { SavedCollectionProduct } from "@wishnest/shared";

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
  const [removingProductId, setRemovingProductId] = useState<string | null>(
    null,
  );

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
        err instanceof Error ? err.message : "Couldn't load this collection.",
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
    <main className="min-h-full box-border bg-[#f8f9fc] p-[18px] font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#20243a]">
      <header className="flex items-center justify-between gap-3">
        <button
          className="cursor-pointer border-0 bg-transparent py-[7px] text-xs font-semibold text-[#5867bd] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#5269dc]"
          type="button"
          onClick={onBack}
        >
          <span className="mr-1 text-base" aria-hidden="true">
            ←
          </span>
          Dashboard
        </button>

        <div className="flex items-center gap-2.5">
          <button
            className="cursor-pointer whitespace-nowrap rounded-[9px] border-0 bg-[#4258c9] px-2.5 py-2 text-[11px] font-semibold text-white disabled:cursor-wait disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#5269dc]"
            type="button"
            onClick={onCaptureProduct}
            disabled={captureBusy}
          >
            {captureBusy ? "Detecting..." : "+ Capture product"}
          </button>
          <span className="text-xs font-bold text-[#5f687c]">WishNest</span>
        </div>
      </header>

      <section className="my-[25px] mb-[22px] flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#e9edff] text-[28px] text-[#5267ce]">
          ♡
        </div>

        <div className="min-w-0">
          <h1 className="m-0 break-words text-[21px] tracking-[-0.5px]">
            {collectionName || "Collection"}
          </h1>
          <p className="mt-[5px] text-xs text-[#5f687c]">
            {loading
              ? "Loading saved products..."
              : `${products.length} ${
                  products.length === 1 ? "product" : "products"
                } saved`}
          </p>
        </div>
      </section>

      {saveMessage && (
        <div
          className="mb-3 rounded-[10px] border border-[#c9e8d5] bg-[#effaf3] px-3 py-2.5 text-xs text-[#247544]"
          role="status"
        >
          {saveMessage}
        </div>
      )}

      {captureError && (
        <div
          className="rounded-[10px] border border-[#f1caca] bg-[#fff4f4] p-3 text-xs text-[#a52b35]"
          role="alert"
        >
          <p className="break-words">{captureError}</p>
        </div>
      )}

      {error && (
        <div
          className="rounded-[10px] border border-[#f1caca] bg-[#fff4f4] p-3 text-xs text-[#a52b35]"
          role="alert"
        >
          <p className="break-words">{error}</p>
          <button
            className="mt-2 cursor-pointer rounded-[9px] border-0 bg-[#4258c9] px-3 py-[9px] text-[11px] font-semibold text-white"
            type="button"
            onClick={() => void loadProducts()}
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div
          className="flex flex-col items-center gap-2.5 py-[55px] text-xs text-[#5f687c]"
          role="status"
        >
          <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#e2e6f8] border-t-[#5267ce] motion-reduce:animate-none" />
          <p>Loading your products...</p>
        </div>
      ) : error ? null : products.length === 0 ? (
        <section className="flex flex-col items-center rounded-[15px] border border-dashed border-[#dce0ed] bg-surface px-[18px] py-8 text-center">
          <div className="mb-3.5 grid h-12 w-12 place-items-center rounded-[15px] bg-[#eef0ff] text-[27px] text-[#5267ce]">
            ＋
          </div>
          <h2 className="m-0 text-[15px] font-semibold">
            This collection is waiting for its first find
          </h2>
          <p className="my-[9px] mb-4 max-w-[270px] text-xs leading-[1.7] text-[#5f687c]">
            When you discover something you love, capture it from a shopping
            page and save it to this collection.
          </p>
          <button
            className="cursor-pointer rounded-[9px] border-0 bg-[#4258c9] px-3 py-[9px] text-[11px] font-semibold text-white"
            type="button"
            onClick={onBack}
          >
            Back to dashboard
          </button>
        </section>
      ) : (
        <section className="flex flex-col gap-2.5">
          {products.map((product) => (
            <article
              className="flex min-w-0 items-center gap-[11px] rounded-[13px] border border-[#e8eaf2] bg-surface p-2.5"
              key={product.item.product_id}
            >
              <button
                className="grid h-20 w-[76px] shrink-0 cursor-pointer place-items-center overflow-hidden rounded-[10px] border-0 bg-secondary p-0 text-[28px] text-[#5f687c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5269dc]"
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
                  <img
                    className="h-full w-full object-contain"
                    src={product.product.image_url}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <span aria-hidden="true">♡</span>
                )}
              </button>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <button
                  className="line-clamp-2 cursor-pointer overflow-hidden break-words border-0 bg-transparent p-0 text-left text-xs font-semibold text-[#252a40] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5269dc]"
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

                <strong className="text-xs">
                  {formatPrice(
                    product.product.current_price,
                    product.product.currency,
                  ) ?? "Price unavailable"}
                </strong>

                <span className="text-[10px] text-[#5f687c]">
                  Added{" "}
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(product.item.added_at))}
                </span>
              </div>

              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <button
                  className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[9px] border border-[#e8eaf2] bg-surface text-[17px] text-[#6974b5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5269dc]"
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
                  className="cursor-pointer border-0 bg-transparent px-0.5 py-1 text-[10px] font-semibold text-[#a52b35] disabled:cursor-wait disabled:opacity-60"
                  type="button"
                  onClick={() => void handleRemove(product.product.id)}
                  disabled={removingProductId === product.product.id}
                >
                  {removingProductId === product.product.id
                    ? "Removing..."
                    : "Remove"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

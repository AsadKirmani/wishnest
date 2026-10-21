import type { RecentProduct } from "@wishnest/shared";

type RecentProductsPreviewProps = {
  products: RecentProduct[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
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

export default function RecentProductsPreview({
  products,
  loading,
  error,
  onRetry,
  onOpenCollection,
}: RecentProductsPreviewProps) {
  return (
    <section className="mt-9" aria-busy={loading}>
      <header className="mb-4 flex items-end justify-between">
        <div>
          <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-[#5965d8]">
            YOUR LATEST FINDS
          </p>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.035em] text-[#172033]">
            Recently added
          </h2>
          <p className="mt-1.5 text-sm text-[#596579]">
            Quickly get back to something you saved.
          </p>
        </div>
      </header>

      {error && (
        <div
          className="flex items-center justify-between gap-3 rounded-[10px] border border-[#f0c7cb] bg-[#fff5f5] p-3 text-[13px] text-[#9e2734]"
          role="alert"
        >
          <p className="m-0 min-w-0 [overflow-wrap:anywhere]">{error}</p>
          <button
            className="shrink-0 cursor-pointer rounded-lg border border-[#e7b8bd] bg-white px-2.5 py-[7px] text-[#9e2734] hover:bg-[#fff0f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9e2734]"
            type="button"
            onClick={onRetry}
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <p
          className="rounded-[14px] border border-dashed border-[#cbd3e0] bg-white px-[18px] py-7 text-center text-[13px] leading-[1.6] text-[#596579]"
          role="status"
        >
          Loading recent products...
        </p>
      ) : !error && products.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[#cbd3e0] bg-white px-[18px] py-7 text-center">
          <span
            className="inline-grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef1ff] text-[27px] text-[#4055c7]"
            aria-hidden="true"
          >
            ♡
          </span>
          <h3 className="mt-3 mb-0 text-[15px] font-semibold text-[#172033]">
            No products saved yet
          </h3>
          <p className="mx-auto mt-[7px] mb-0 max-w-[420px] text-[13px] leading-[1.6] text-[#596579]">
            Products you add to your collections will show up here for quick
            access.
          </p>
        </div>
      ) : (
        !error && (
          <div className="grid grid-cols-2 gap-2.5 min-[641px]:grid-cols-[repeat(auto-fit,minmax(210px,1fr))] min-[641px]:gap-3.5">
            {products.map((product) => (
              <article
                className="min-w-0 overflow-hidden rounded-[14px] border border-[#e0e5ee] bg-white shadow-[0_2px_8px_rgb(22_32_51_/_3%)]"
                key={`${product.collectionId}-${product.id}`}
              >
                <a
                  className="grid h-[120px] place-items-center overflow-hidden bg-[#f2f4f8] text-[32px] text-[#69758a] no-underline min-[641px]:h-[150px]"
                  href={product.canonical_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${product.title}`}
                >
                  {product.image_url ? (
                    <img
                      className="h-full w-full object-contain [mix-blend-mode:multiply]"
                      src={product.image_url}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span aria-hidden="true">♡</span>
                  )}
                </a>

                <div className="flex flex-col items-start gap-2 p-[11px] min-[641px]:p-3.5">
                  <a
                    className="line-clamp-2 max-w-full [overflow-wrap:anywhere] text-sm font-semibold leading-[1.45] text-[#172033] no-underline hover:text-[#4055c7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4055c7] min-[641px]:text-sm"
                    href={product.canonical_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {product.title}
                  </a>

                  <button
                    className="cursor-pointer border-0 bg-transparent p-0 text-left text-xs font-semibold text-[#4055c7] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4055c7]"
                    type="button"
                    onClick={() => onOpenCollection(product.collectionId)}
                  >
                    {product.collectionName}
                  </button>

                  <strong className="text-sm text-[#172033]">
                    {formatPrice(
                      product.current_price,
                      product.currency,
                    ) ?? "Price unavailable"}
                  </strong>
                </div>
              </article>
            ))}
          </div>
        )
      )}
    </section>
  );
}
import { useDashboard } from "../hooks/useDashboard";

type DashboardProps = {
  email: string;
  onCaptureProduct: () => void;
  onCreateCollection: () => void;
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
  onCreateCollection,
  captureBusy,
  onLogout,
  onOpenCollection,
}: DashboardProps) {
  const { collections, recentProducts, loading, error, refresh } =
    useDashboard();

  const buttonBase =
    "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#5269dc] disabled:cursor-wait disabled:opacity-65";

  const captureButton =
    `${buttonBase} shrink-0 rounded-[10px] border-0 bg-[#4258c9] px-3 py-2.5 text-[11px] font-semibold text-white shadow-[0_3px_8px_#4258c921] transition-colors hover:bg-[#3549b2]`;

  return (
    <main className="box-border min-h-full w-full bg-[#f8f9fc] p-[18px] font-sans text-[#20243a]">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[13px] bg-[#e7ebff] text-[22px] font-extrabold text-[#4258c9]"
            aria-hidden="true"
          >
            W
          </div>

          <div className="min-w-0">
            <h1 className="m-0 text-[19px] tracking-[-0.5px]">
              WishNest
            </h1>
            <p className="mt-[3px] text-xs text-[#7c8298]">
              Your wishlist, in one place.
            </p>
          </div>
        </div>

        <button
          className={`${buttonBase} rounded-[9px] border border-[#e3e6ef] bg-white px-[9px] py-[7px] text-[11px] text-[#626a80]`}
          type="button"
          onClick={onLogout}
          aria-label={`Log out ${email}`}
          title={`Logged in as ${email}`}
        >
          Log out
        </button>
      </header>

      <section className="mt-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 text-xl tracking-[-0.6px]">
            Your wishlist
          </h2>
          <p className="mt-[3px] text-xs text-[#7c8298]">
            Keep the things you love, all in one place.
          </p>
        </div>

        <button
          className={captureButton}
          type="button"
          onClick={onCaptureProduct}
          disabled={captureBusy}
        >
          {captureBusy ? "Detecting..." : "+ Capture product"}
        </button>
      </section>

      {error && (
        <div
          className="mt-4 flex items-center justify-between gap-2.5 rounded-[10px] border border-[#f1caca] bg-[#fff4f4] p-[11px] text-[11px] text-[#a52b35]"
          role="alert"
        >
          <p className="m-0 min-w-0 [overflow-wrap:anywhere]">{error}</p>
          <button
            className={`${buttonBase} shrink-0 rounded-[7px] border border-[#e9baba] bg-white px-2 py-1.5 text-[10px] text-[#a52b35]`}
            type="button"
            onClick={() => void refresh()}
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div
          className="flex flex-col items-center gap-2.5 py-[60px] text-xs text-[#5f687c]"
          role="status"
        >
          <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#e2e6f8] border-t-[#5267ce] motion-reduce:animate-none" />
          <p>Loading your wishlist...</p>
        </div>
      ) : (
        <>
          <section className="mt-[27px]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="m-0 text-[15px] tracking-[-0.2px]">
                  My collections
                </h2>
                <p className="mt-[3px] text-xs text-[#7c8298]">
                  Organize your saved finds.
                </p>
              </div>

              <span className="grid h-[27px] min-w-[27px] shrink-0 box-border place-items-center rounded-[9px] bg-[#e9edff] px-1.5 text-xs font-bold text-[#4258c9]">
                {collections.length}
              </span>

              <button
                className={captureButton}
                type="button"
                onClick={onCreateCollection}
              >
                + Create collection
              </button>
            </div>

            {collections.length === 0 ? (
              <div className="flex flex-col items-center rounded-[14px] border border-dashed border-[#dce0ed] bg-white px-4 py-6 text-center">
                <div className="mb-3 grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[10px] bg-[#eef0ff] text-[25px] text-[#5267ce]">
                  ♡
                </div>
                <h3 className="m-0 text-[13px] font-semibold">
                  Your collections will live here
                </h3>
                <p className="mt-1.5 max-w-[260px] text-xs leading-[1.6] text-[#5f687c]">
                  Create a collection to organize your favorite finds.
                </p>
                <button
                  className={`${captureButton} mt-3`}
                  type="button"
                  onClick={onCreateCollection}
                >
                  + Create collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-[9px] sm:grid-cols-2">
                {collections.map((collection) => (
                  <button
                    className={`${buttonBase} flex min-w-0 items-center gap-[9px] rounded-[13px] border border-[#e8eaf2] bg-white px-2.5 py-3 text-left transition-[border-color,transform,box-shadow] duration-150 hover:-translate-y-px hover:border-[#cbd3ff] hover:shadow-[0_4px_12px_#26315c0a] motion-reduce:transform-none motion-reduce:transition-none`}
                    type="button"
                    key={collection.id}
                    onClick={() => onOpenCollection(collection.id)}
                  >
                    <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-[#eef0ff] text-[21px] text-[#5267ce]">
                      ♡
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <strong className="overflow-hidden text-xs text-ellipsis whitespace-nowrap">
                        {collection.name}
                      </strong>
                      <span className="text-[10px] text-[#5f687c]">
                        {collection.productCount}{" "}
                        {collection.productCount === 1
                          ? "product"
                          : "products"}
                      </span>
                    </span>

                    <span className="shrink-0 text-xl text-[#5f687c]">
                      ›
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="mt-[27px]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="m-0 text-[15px] tracking-[-0.2px]">
                  Recently added
                </h2>
                <p className="mt-[3px] text-xs text-[#7c8298]">
                  Your latest saved finds.
                </p>
              </div>
            </div>

            {recentProducts.length === 0 ? (
              <div className="flex flex-col items-center rounded-[14px] border border-dashed border-[#dce0ed] bg-white px-3.5 py-5 text-center">
                <div className="mb-3 grid h-[42px] w-[42px] place-items-center rounded-[10px] bg-[#eef0ff] text-[25px] text-[#5267ce]">
                  ＋
                </div>
                <h3 className="m-0 text-[13px] font-semibold">
                  Nothing saved just yet
                </h3>
                <p className="mt-1.5 max-w-[260px] text-xs leading-[1.6] text-[#5f687c]">
                  Find something you like on a shopping site and capture it to
                  see it here.
                </p>
                <button
                  className={`${buttonBase} mt-[13px] rounded-[9px] border border-[#d8defe] bg-[#f0f2ff] px-3 py-2 text-[11px] font-semibold text-[#4258c9]`}
                  type="button"
                  onClick={onCaptureProduct}
                  disabled={captureBusy}
                >
                  {captureBusy
                    ? "Detecting..."
                    : "Save your first product"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-[9px]">
                {recentProducts.map((product) => (
                  <article
                    className="flex min-w-0 items-center gap-[11px] rounded-[13px] border border-[#e8eaf2] bg-white p-2.5"
                    key={`${product.collectionId}-${product.id}`}
                  >
                    <button
                      className={`${buttonBase} grid h-[72px] w-[68px] shrink-0 place-items-center overflow-hidden rounded-[10px] border-0 bg-[#f1f3f8] p-0`}
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
                          className="h-full w-full object-contain"
                          src={product.image_url}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-[28px] text-[#5f687c]">
                          ♡
                        </span>
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <button
                        className={`${buttonBase} block max-w-full overflow-hidden border-0 bg-transparent p-0 text-left text-xs font-semibold text-[#252a40] text-ellipsis whitespace-nowrap`}
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
                        className={`${buttonBase} mt-[5px] block max-w-full overflow-hidden border-0 bg-transparent p-0 text-left text-[10px] text-[#6474cb] text-ellipsis whitespace-nowrap`}
                        type="button"
                        onClick={() => onOpenCollection(product.collectionId)}
                      >
                        {product.collectionName}
                      </button>

                      <div className="mt-[11px] flex items-baseline justify-between gap-3">
                        <strong className="min-w-0 overflow-hidden text-xs text-ellipsis">
                          {formatPrice(
                            product.current_price,
                            product.currency,
                          ) ?? "Price unavailable"}
                        </strong>
                        <span className="shrink-0 text-[10px] text-[#5f687c]">
                          {formatDate(product.addedAt)}
                        </span>
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
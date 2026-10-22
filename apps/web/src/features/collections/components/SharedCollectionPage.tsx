
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface SharedProduct {
  id: string;
  canonical_url: string;
  title: string;
  image_url: string | null;
  current_price: number | null;
  currency: string | null;
  note?: string | null;
  position?: number;
  product?: {
    id: string;
    canonical_url: string;
    title: string;
    image_url: string | null;
    current_price: number | null;
    currency: string | null;
  } | null;
}

interface SharedCollection {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  created_at: string;
}

interface SharedCollectionResponse {
  collection: SharedCollection;
  products: SharedProduct[];
}

interface Props {
  token: string;
}

export default function SharedCollectionPage({ token }: Props) {
  const [data, setData] = useState<SharedCollectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSharedCollection() {
      setLoading(true);
      setError("");
      setData(null);

      try {
        const { data: result, error: functionError } =
          await supabase.functions.invoke("get-shared-collection", {
            body: { token },
          });

        if (functionError) throw functionError;

        if (
          !result ||
          !result.collection ||
          !Array.isArray(result.products)
        ) {
          throw new Error("The share link returned an invalid response.");
        }

        if (active) {
          setData(result as SharedCollectionResponse);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this shared collection.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSharedCollection();

    return () => {
      active = false;
    };
  }, [token]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-content-muted">
        <div className="flex items-center gap-3" role="status">
          <span className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
          Loading shared collection...
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-content">
        <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
          <h1 className="text-xl font-semibold">Collection unavailable</h1>
          <p className="mt-2 text-sm text-content-muted">
            {error || "This share link is invalid, expired, or has been revoked."}
          </p>
          <a
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            <ArrowLeft size={16} />
            Back to WishNest
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-content">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-content-muted hover:text-content"
        >
          <ArrowLeft size={16} />
          WishNest
        </a>

        <header className="mt-8">
          <p className="text-sm font-medium text-primary">
            Shared collection
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {data.collection.name}
          </h1>
          {data.collection.description?.trim() && (
            <p className="mt-3 max-w-2xl text-content-muted">
              {data.collection.description}
            </p>
          )}
          <p className="mt-3 text-sm text-content-muted">
            {data.products.length}{" "}
            {data.products.length === 1 ? "item" : "items"}
          </p>
        </header>

        {data.products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border p-8 text-center text-content-muted">
            This collection has no saved products yet.
          </div>
        ) : (
          <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.products.map((item, index) => {
              const product = item.product ?? item;

              return (
                <article
                  key={product.id || `${product.canonical_url}-${index}`}
                  className="overflow-hidden rounded-2xl border border-border bg-surface"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center bg-background text-sm text-content-muted">
                      No image available
                    </div>
                  )}

                  <div className="p-4">
                    <h2 className="font-medium">{product.title}</h2>

                    {product.current_price != null && (
                      <p className="mt-2 text-sm font-semibold">
                        {product.currency
                          ? `${product.currency} `
                          : ""}
                        {product.current_price}
                      </p>
                    )}

                    {item.note?.trim() && (
                      <p className="mt-2 text-sm text-content-muted">
                        {item.note}
                      </p>
                    )}

                    <a
                      href={product.canonical_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      View product
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

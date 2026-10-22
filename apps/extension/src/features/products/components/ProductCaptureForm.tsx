import { useEffect, useState, type FormEvent } from "react";
import type { ProductDraft } from "../types";

interface ProductCaptureFormProps {
  initialProduct: ProductDraft;
  busy: boolean;
  onSubmit: (product: ProductDraft) => Promise<void>;
  onCancel: () => void;
}

export default function ProductCaptureForm({
  initialProduct,
  busy,
  onSubmit,
  onCancel,
}: ProductCaptureFormProps) {
  const [url, setUrl] = useState(initialProduct.url);
  const [title, setTitle] = useState(initialProduct.title);
  const [imageUrl, setImageUrl] = useState(initialProduct.imageUrl ?? "");
  const [price, setPrice] = useState(
    initialProduct.price === null ? "" : String(initialProduct.price),
  );
  const [currency, setCurrency] = useState(initialProduct.currency ?? "INR");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUrl(initialProduct.url);
    setTitle(initialProduct.title);
    setImageUrl(initialProduct.imageUrl ?? "");
    setPrice(
      initialProduct.price === null ? "" : String(initialProduct.price),
    );
    setCurrency(initialProduct.currency ?? "INR");
    setError(null);
  }, [initialProduct]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Product title is required.");
      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url.trim());
    } catch {
      setError("Enter a valid product URL.");
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setError("Product URL must use HTTP or HTTPS.");
      return;
    }

    let normalizedImageUrl: string | null = null;

    if (imageUrl.trim()) {
      try {
        const parsedImage = new URL(imageUrl.trim());

        if (!["http:", "https:"].includes(parsedImage.protocol)) {
          setError("Image URL must use HTTP or HTTPS.");
          return;
        }

        normalizedImageUrl = parsedImage.href;
      } catch {
        setError("Enter a valid image URL.");
        return;
      }
    }

    let numericPrice: number | null = null;

    if (price.trim()) {
      numericPrice = Number(price);

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        setError("Enter a valid non-negative price.");
        return;
      }
    }

    try {
      await onSubmit({
        url: parsedUrl.href,
        title: trimmedTitle,
        imageUrl: normalizedImageUrl,
        price: numericPrice,
        currency: numericPrice === null ? null : currency,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not prepare the product.",
      );
    }
  }

  const inputClasses =
    "box-border w-full min-w-0 rounded-lg border border-[#d9deea] bg-surface px-2.5 py-[9px] text-[13px] text-[#172033] focus:border-[#5965d8] focus:outline-2 focus:outline-[#c7d2fe] focus:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-60";

  const actionButton =
    "flex-1 cursor-pointer rounded-lg border-0 bg-[#5965d8] p-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#4955c5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5965d8] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form
      className="grid gap-2.5 p-4"
      onSubmit={handleSubmit}
    >
      <h2 className="mb-1.5 mt-0 text-lg font-semibold text-[#172033]">
        Review product
      </h2>

      {imageUrl && (
        <img
          className="h-[130px] w-full rounded-[10px] bg-secondary object-contain"
          src={imageUrl}
          alt="Product preview"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      )}

      <label
        className="text-xs font-semibold text-[#334155]"
        htmlFor="capture-title"
      >
        Product title
      </label>
      <input
        className={inputClasses}
        id="capture-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={300}
        required
        disabled={busy}
      />

      <label
        className="text-xs font-semibold text-[#334155]"
        htmlFor="capture-url"
      >
        Product URL
      </label>
      <input
        className={inputClasses}
        id="capture-url"
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        required
        disabled={busy}
      />

      <label
        className="text-xs font-semibold text-[#334155]"
        htmlFor="capture-image"
      >
        Image URL
      </label>
      <input
        className={inputClasses}
        id="capture-image"
        type="url"
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
        disabled={busy}
      />

      <div className="grid grid-cols-2 gap-2.5">
        <div className="grid min-w-0 gap-2.5">
          <label
            className="text-xs font-semibold text-[#334155]"
            htmlFor="capture-price"
          >
            Price
          </label>
          <input
            className={inputClasses}
            id="capture-price"
            type="number"
            min="0"
            step="any"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            disabled={busy}
          />
        </div>

        <div className="grid min-w-0 gap-2.5">
          <label
            className="text-xs font-semibold text-[#334155]"
            htmlFor="capture-currency"
          >
            Currency
          </label>
          <select
            className={inputClasses}
            id="capture-currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            disabled={busy || !price.trim()}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      {error && (
        <p
          className="m-0 [overflow-wrap:anywhere] text-xs text-[#b42332]"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="mt-2 flex gap-2">
        <button
          className={actionButton}
          type="submit"
          disabled={busy}
        >
          {busy ? "Processing..." : "Continue"}
        </button>

        <button
          className={`${actionButton} border border-[#d9deea] bg-surface text-[#30394c] hover:bg-secondary`}
          type="button"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
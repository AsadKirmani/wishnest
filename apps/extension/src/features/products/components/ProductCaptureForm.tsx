
import { useEffect, useState, type FormEvent } from "react";
import type { ProductDraft } from "../types";
import "./ProductCaptureForm.css";

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

  return (
    <form className="product-capture-form" onSubmit={handleSubmit}>
      <h2>Review product</h2>

      {imageUrl && (
        <img
          className="capture-image-preview"
          src={imageUrl}
          alt="Product preview"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      )}

      <label htmlFor="capture-title">Product title</label>
      <input
        id="capture-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={300}
        required
        disabled={busy}
      />

      <label htmlFor="capture-url">Product URL</label>
      <input
        id="capture-url"
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        required
        disabled={busy}
      />

      <label htmlFor="capture-image">Image URL</label>
      <input
        id="capture-image"
        type="url"
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
        disabled={busy}
      />

      <div className="capture-price-row">
        <div>
          <label htmlFor="capture-price">Price</label>
          <input
            id="capture-price"
            type="number"
            min="0"
            step="any"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            disabled={busy}
          />
        </div>

        <div>
          <label htmlFor="capture-currency">Currency</label>
          <select
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

      {error && <p className="capture-error" role="alert">{error}</p>}

      <div className="capture-actions">
        <button type="submit" disabled={busy}>
          {busy ? "Processing..." : "Continue"}
        </button>

        <button
          type="button"
          className="capture-secondary"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}


import { useState, type FormEvent } from "react";
import type { Collection } from "../../collections/types";
import type { SaveProductInput } from "../types";

interface ProductFormProps {
  collections: Collection[];
  initialCollectionId?: string;
  busy: boolean;
  onSubmit: (input: SaveProductInput) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({
  collections,
  initialCollectionId,
  busy,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [collectionId, setCollectionId] = useState(
    initialCollectionId ?? collections[0]?.id ?? "",
  );
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!collectionId) {
      setFormError("Choose a collection.");
      return;
    }

    if (!title.trim()) {
      setFormError("Product title is required.");
      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url.trim());
    } catch {
      setFormError("Enter a valid product URL.");
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setFormError("Product URL must use HTTP or HTTPS.");
      return;
    }

    if (imageUrl.trim()) {
      try {
        const parsedImageUrl = new URL(imageUrl.trim());

        if (!["http:", "https:"].includes(parsedImageUrl.protocol)) {
          setFormError("Image URL must use HTTP or HTTPS.");
          return;
        }
      } catch {
        setFormError("Enter a valid image URL.");
        return;
      }
    }

    let numericPrice: number | null = null;

    if (price.trim()) {
      numericPrice = Number(price);

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        setFormError("Enter a valid non-negative price.");
        return;
      }
    }

    try {
      await onSubmit({
        collectionId,
        url: parsedUrl.href,
        title: title.trim(),
        imageUrl: imageUrl.trim() || null,
        price: numericPrice,
        currency: numericPrice === null ? null : currency,
        note: note.trim() || null,
      });

      setUrl("");
      setTitle("");
      setImageUrl("");
      setPrice("");
      setCurrency("INR");
      setNote("");
    } catch {
      // The parent displays the repository error.
    }
  }

  const fieldClass =
    "box-border w-full min-w-0 rounded-[9px] border border-border bg-surface px-3 py-[11px] text-sm text-content placeholder:text-content-muted focus:border-primary focus:outline-2 focus:outline-accent disabled:cursor-not-allowed disabled:opacity-70";

  const labelClass = "text-sm font-semibold text-content";

  const secondaryButtonClass =
    "rounded-[9px] border border-border bg-secondary px-4 py-[11px] font-semibold text-content transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form className="grid gap-[18px]" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className={labelClass} htmlFor="product-collection">
          Save to collection
        </label>

        <select
          id="product-collection"
          className={fieldClass}
          value={collectionId}
          onChange={(event) => setCollectionId(event.target.value)}
          required
          disabled={busy || collections.length === 0}
        >
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className={labelClass} htmlFor="product-url">
          Product URL
        </label>

        <input
          id="product-url"
          className={fieldClass}
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/product"
          required
          disabled={busy}
        />
      </div>

      <div className="grid gap-2">
        <label className={labelClass} htmlFor="product-title">
          Product title
        </label>

        <input
          id="product-title"
          className={fieldClass}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Product name"
          maxLength={300}
          required
          disabled={busy}
        />
      </div>

      <div className="grid gap-2">
        <label className={labelClass} htmlFor="product-image">
          Image URL{" "}
          <span className="font-normal text-content-muted">(optional)</span>
        </label>

        <input
          id="product-image"
          className={fieldClass}
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={busy}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3 max-[480px]:grid-cols-1">
        <div className="grid content-start gap-2">
          <label className={labelClass} htmlFor="product-price">
            Price{" "}
            <span className="font-normal text-content-muted">(optional)</span>
          </label>

          <input
            id="product-price"
            className={fieldClass}
            type="number"
            min="0"
            step="any"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="e.g. 1499"
            disabled={busy}
          />
        </div>

        <div className="grid content-start gap-2">
          <label className={labelClass} htmlFor="product-currency">
            Currency
          </label>

          <select
            id="product-currency"
            className={fieldClass}
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

      <div className="grid gap-2">
        <label className={labelClass} htmlFor="product-note">
          Note{" "}
          <span className="font-normal text-content-muted">(optional)</span>
        </label>

        <textarea
          id="product-note"
          className={`${fieldClass} resize-y`}
          rows={2}
          maxLength={1000}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Why do you want this product?"
          disabled={busy}
        />
      </div>

      {formError && (
        <p
          className="m-0 rounded-lg border border-primary bg-secondary px-3 py-2.5 text-sm text-content"
          role="alert"
        >
          {formError}
        </p>
      )}

      <div className="flex flex-wrap gap-2.5">
        <button
          type="submit"
          className="rounded-[9px] bg-primary px-4 py-[11px] font-semibold text-on-primary transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy || collections.length === 0}
        >
          {busy ? "Saving..." : "Save product"}
        </button>

        <button
          type="button"
          className={secondaryButtonClass}
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
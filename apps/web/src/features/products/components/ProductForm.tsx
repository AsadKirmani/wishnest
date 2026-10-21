
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

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="product-collection">Save to collection</label>
        <select
          id="product-collection"
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

      <div className="form-field">
        <label htmlFor="product-url">Product URL</label>
        <input
          id="product-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/product"
          required
          disabled={busy}
        />
      </div>

      <div className="form-field">
        <label htmlFor="product-title">Product title</label>
        <input
          id="product-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Product name"
          maxLength={300}
          required
          disabled={busy}
        />
      </div>

      <div className="form-field">
        <label htmlFor="product-image">Image URL (optional)</label>
        <input
          id="product-image"
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={busy}
        />
      </div>

      <div className="product-form-row">
        <div className="form-field">
          <label htmlFor="product-price">Price (optional)</label>
          <input
            id="product-price"
            type="number"
            min="0"
            step="any"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="e.g. 1499"
            disabled={busy}
          />
        </div>

        <div className="form-field">
          <label htmlFor="product-currency">Currency</label>
          <select
            id="product-currency"
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

      <div className="form-field">
        <label htmlFor="product-note">Note (optional)</label>
        <textarea
          id="product-note"
          rows={2}
          maxLength={1000}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Why do you want this product?"
          disabled={busy}
        />
      </div>

      {formError && <p className="form-error">{formError}</p>}

      <div className="form-actions">
        <button type="submit" disabled={busy || collections.length === 0}>
          {busy ? "Saving..." : "Save product"}
        </button>

        <button
          type="button"
          className="button-secondary"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

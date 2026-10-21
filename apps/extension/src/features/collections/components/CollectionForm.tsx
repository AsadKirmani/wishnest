
import { useState, type FormEvent } from "react";
import type { CreateCollectionInput } from "@wishnest/shared";
import type { UserCollection } from "../services/collectionRepository";
import "./CollectionForm.css";

interface CollectionFormProps {
  existingCollections: UserCollection[];
  busy: boolean;
  onSubmit: (input: CreateCollectionInput) => Promise<void>;
  onCancel?: () => void;
}

export default function CollectionForm({
  existingCollections,
  busy,
  onSubmit,
  onCancel,
}: CollectionFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] =
    useState<CreateCollectionInput["visibility"]>("private");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Collection name is required.");
      return;
    }

    const normalizedName = trimmedName.toLowerCase();

    const duplicateExists = existingCollections.some(
      (item) => item.name.trim().toLowerCase() === normalizedName,
    );

    if (duplicateExists) {
      setFormError("A collection with this name already exists.");
      return;
    }

    if (trimmedName.length > 80) {
      setFormError("Collection name must be 80 characters or fewer.");
      return;
    }

    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim() || null,
        visibility,
      });

      setName("");
      setDescription("");
      setVisibility("private");
    } catch {
      // The parent displays the repository error.
    }
  }

  return (
    <form className="collection-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="collection-name">Collection name</label>
        <input
          id="collection-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Wishlist, Gaming setup"
          maxLength={80}
          required
          disabled={busy}
        />
      </div>

      <div className="form-field">
        <label htmlFor="collection-description">
          Description <span>(optional)</span>
        </label>
        <textarea
          id="collection-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What are you collecting?"
          rows={3}
          maxLength={500}
          disabled={busy}
        />
      </div>

      <div className="form-field">
        <label htmlFor="collection-visibility">Visibility</label>
        <select
          id="collection-visibility"
          value={visibility}
          onChange={(event) =>
            setVisibility(
              event.target.value as CreateCollectionInput["visibility"],
            )
          }
          disabled={busy}
        >
          <option value="private">Private — only you</option>
          <option value="public">Public — visibility setting only</option>
        </select>
        <p className="field-hint">
          Public sharing links will be implemented separately.
        </p>
      </div>

      {formError && <p className="form-error">{formError}</p>}

      <div className="form-actions">
        <button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Create collection"}
        </button>

        {onCancel && (
          <button
            type="button"
            className="button-secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

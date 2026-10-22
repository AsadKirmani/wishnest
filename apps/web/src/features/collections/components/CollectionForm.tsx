
import { useEffect, useState, type FormEvent } from "react";
import type {
  Collection,
  CollectionVisibility,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "../types";

interface CollectionFormProps {
  collection?: Collection | null;
  existingCollections: Collection[];
  busy: boolean;
  onSubmit: (
    input: CreateCollectionInput | UpdateCollectionInput,
  ) => Promise<void>;
  onCancel?: () => void;
}

export default function CollectionForm({
  collection,
  existingCollections,
  busy,
  onSubmit,
  onCancel,
}: CollectionFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CollectionVisibility>("private");
  const [formError, setFormError] = useState<string | null>(null);

  const isEditing = Boolean(collection);

  useEffect(() => {
    setName(collection?.name ?? "");
    setDescription(collection?.description ?? "");
    setVisibility(collection?.visibility ?? "private");
    setFormError(null);
  }, [collection]);

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
      (item) =>
        item.id !== collection?.id &&
        item.name.trim().toLowerCase() === normalizedName,
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

      if (!isEditing) {
        setName("");
        setDescription("");
        setVisibility("private");
      }
    } catch {
      // The parent displays the repository error.
    }
  }

  const fieldClass =
    "box-border w-full rounded-[9px] border border-border bg-surface px-3 py-[11px] font-inherit text-content focus:border-primary focus:outline-2 focus:outline-accent disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form className="grid gap-[18px] text-content" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label htmlFor="collection-name" className="text-sm font-semibold">
          Collection name
        </label>

        <input
          id="collection-name"
          className={fieldClass}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Wishlist, Gaming setup"
          maxLength={80}
          required
          disabled={busy}
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="collection-description"
          className="text-sm font-semibold"
        >
          Description{" "}
          <span className="text-[13px] font-normal text-content-muted">
            (optional)
          </span>
        </label>

        <textarea
          id="collection-description"
          className={fieldClass}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What are you collecting?"
          rows={3}
          maxLength={500}
          disabled={busy}
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="collection-visibility"
          className="text-sm font-semibold"
        >
          Visibility
        </label>

        <select
          id="collection-visibility"
          className={fieldClass}
          value={visibility}
          onChange={(event) =>
            setVisibility(event.target.value as CollectionVisibility)
          }
          disabled={busy}
        >
          <option value="private">Private — only you</option>
          <option value="public">Public — visibility setting only</option>
        </select>

        <p className="m-0 text-[13px] font-normal text-content-muted">
          Public sharing links will be implemented separately.
        </p>
      </div>

      {formError && (
        <p className="m-0 text-sm text-red-600" role="alert">
          {formError}
        </p>
      )}

      <div className="flex flex-wrap gap-2.5">
        <button
          type="submit"
          className="rounded-[9px] bg-primary px-4 py-[11px] font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy}
        >
          {busy
            ? "Saving..."
            : isEditing
              ? "Save changes"
              : "Create collection"}
        </button>

        {onCancel && (
          <button
            type="button"
            className="rounded-[9px] bg-secondary px-4 py-[11px] font-semibold text-content disabled:cursor-not-allowed disabled:opacity-60"
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
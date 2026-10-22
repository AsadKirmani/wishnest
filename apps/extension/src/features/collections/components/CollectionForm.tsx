import { useState, type FormEvent } from "react";
import type { CreateCollectionInput } from "@wishnest/shared";
import type { UserCollection } from "../services/collectionRepository";

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

  const inputClasses =
    "box-border w-full rounded-lg border border-[#cbd5e1] bg-surface px-3 py-2.5 text-[13px] text-[#172033] placeholder:text-slate-400 focus:border-[#4f46e5] focus:outline-2 focus:outline-[#c7d2fe] focus:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-60";

  const actionButton =
    "inline-flex min-h-[38px] cursor-pointer items-center justify-center rounded-lg border border-[#4f46e5] bg-[#4f46e5] px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form
      className="flex flex-col gap-4 bg-surface p-5 text-[#172033]"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-[7px]">
        <label
          className="text-[13px] font-semibold text-[#334155]"
          htmlFor="collection-name"
        >
          Collection name
        </label>

        <input
          className={inputClasses}
          id="collection-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Wishlist, Gaming setup"
          maxLength={80}
          required
          disabled={busy}
        />
      </div>

      <div className="flex flex-col gap-[7px]">
        <label
          className="text-[13px] font-semibold text-[#334155]"
          htmlFor="collection-description"
        >
          Description{" "}
          <span className="font-normal text-[#64748b]">(optional)</span>
        </label>

        <textarea
          className={`${inputClasses} resize-y`}
          id="collection-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What are you collecting?"
          rows={3}
          maxLength={500}
          disabled={busy}
        />
      </div>

      <div className="flex flex-col gap-[7px]">
        <label
          className="text-[13px] font-semibold text-[#334155]"
          htmlFor="collection-visibility"
        >
          Visibility
        </label>

        <select
          className={inputClasses}
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

        <p className="m-0 text-[11px] leading-[1.5] text-[#64748b]">
          Public sharing links will be implemented separately.
        </p>
      </div>

      {formError && (
        <p
          className="m-0 text-xs leading-[1.5] text-[#b91c1c]"
          role="alert"
        >
          {formError}
        </p>
      )}

      <div className="flex flex-wrap gap-2.5">
        <button
          className={actionButton}
          type="submit"
          disabled={busy}
        >
          {busy ? "Saving..." : "Create collection"}
        </button>

        {onCancel && (
          <button
            className="inline-flex min-h-[38px] cursor-pointer items-center justify-center rounded-lg border border-[#cbd5e1] bg-surface px-3.5 text-[13px] font-semibold text-[#334155] transition-colors hover:bg-[#f1f5f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
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
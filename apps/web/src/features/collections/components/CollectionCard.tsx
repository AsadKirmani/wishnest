import { useState } from "react";
import type { Collection } from "../types";

interface CollectionCardProps {
  collection: Collection;
  onView: (collection: Collection) => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  busy: boolean;
}

export default function CollectionCard({
  collection,
  onView,
  onEdit,
  onDelete,
  busy,
}: CollectionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="min-w-0 rounded-2xl border border-[#e3e7ef] bg-white p-[22px]">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 flex-col items-start gap-2 border-0 bg-transparent p-0 text-left text-inherit disabled:cursor-not-allowed"
          onClick={() => onView(collection)}
          aria-label={`View ${collection.name}`}
          disabled={busy}
        >
          <h3 className="m-0 mb-1 break-words text-lg font-semibold">
            {collection.name}
          </h3>

          <span className="inline-block rounded-full bg-[#f0f1ff] px-[9px] py-1 text-xs font-semibold text-[#4e56ba]">
            {collection.visibility === "private" ? "Private" : "Public"}
          </span>
        </button>

        <div className="relative shrink-0">
          <button
            type="button"
            className="grid size-[34px] place-items-center rounded-lg bg-transparent text-inherit hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Actions for ${collection.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            disabled={busy}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="5" cy="12" r="1.7" />
              <circle cx="12" cy="12" r="1.7" />
              <circle cx="19" cy="12" r="1.7" />
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute left-0 top-[calc(100%+4px)] z-10 flex min-w-[120px] flex-col rounded-[10px] border border-slate-200 bg-white p-[5px] shadow-[0_8px_24px_rgb(15_23_42_/_12%)]"
              role="menu"
            >
              <button
                type="button"
                className="rounded-md bg-transparent px-2.5 py-[9px] text-left text-[#172033] hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(collection);
                }}
                disabled={busy}
              >
                Edit
              </button>

              <button
                type="button"
                className="rounded-md bg-transparent px-2.5 py-[9px] text-left text-red-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(collection);
                }}
                disabled={busy}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="my-[18px] min-h-11 break-words leading-[1.6] text-[#647084]">
        {collection.description || "No description added yet."}
      </p>

      <span className="mt-3 block text-xs text-[#626b7f]">
        {new Date(collection.created_at).toLocaleDateString()}
      </span>
    </article>
  );
}
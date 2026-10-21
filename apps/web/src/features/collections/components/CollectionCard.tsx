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
    <article className="collection-card">
      <div className="collection-card-header">
        <div
          className="collection-card-title"
          onClick={() => onView(collection)}
          aria-label={`View ${collection.name}`}
        >
          <h3>{collection.name}</h3>
          <span className="collection-visibility">
            {collection.visibility === "private" ? "Private" : "Public"}
          </span>
        </div>

        <div className="collection-menu">
          <span
            className="collection-menu-trigger"
            aria-label={`Actions for ${collection.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
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
          </span>

          {menuOpen && (
            <div className="collection-menu-dropdown" role="menu">
              <button
                type="button"
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
                role="menuitem"
                className="collection-menu-delete"
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

      <p className="collection-description">
        {collection.description || "No description added yet."}
      </p>

      <span className="collection-date">
        {new Date(collection.created_at).toLocaleDateString()}
      </span>
    </article>
  );
}


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
  return (
    <article className="collection-card">
      <div className="collection-card-header">
        <div>
          <h3>{collection.name}</h3>
          <span className="collection-visibility">
            {collection.visibility === "private" ? "Private" : "Public"}
          </span>
        </div>

        <span className="collection-date">
          {new Date(collection.created_at).toLocaleDateString()}
        </span>
      </div>

      <p className="collection-description">
        {collection.description || "No description added yet."}
      </p>

      <div className="collection-card-actions">
        <button
          type="button"
          className="button-secondary"
          onClick={() => onView(collection)}
          disabled={busy}
        >
          View
        </button>

        <button
          type="button"
          className="button-secondary"
          onClick={() => onEdit(collection)}
          disabled={busy}
        >
          Edit
        </button>

        <button
          type="button"
          className="button-danger"
          onClick={() => onDelete(collection)}
          disabled={busy}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

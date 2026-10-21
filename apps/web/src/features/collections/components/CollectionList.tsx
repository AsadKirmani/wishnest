
import type { Collection } from "../types";
import CollectionCard from "./CollectionCard";

interface CollectionListProps {
  collections: Collection[];
  busy: boolean;
  onView: (collection: Collection) => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
}

export default function CollectionList({
  collections,
  busy,
  onView,
  onEdit,
  onDelete,
}: CollectionListProps) {
  if (collections.length === 0) {
    return (
      <div className="collections-empty">
        <h3>No collections yet</h3>
        <p>Create your first collection to start organizing products.</p>
      </div>
    );
  }

  return (
    <div className="collection-list">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          busy={busy}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

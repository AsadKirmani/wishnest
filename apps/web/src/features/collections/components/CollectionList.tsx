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
      <div className="rounded-2xl border border-dashed border-[#d9deea] px-5 py-[42px] text-center">
        <h3 className="mb-2 text-lg font-semibold">
          No collections yet
        </h3>

        <p className="m-0 text-[#647084]">
          Create your first collection to start organizing products.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-4">
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
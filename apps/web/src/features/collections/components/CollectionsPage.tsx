
import { useState } from "react";
import { useCollections } from "../hooks/useCollections";
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "../types";
import CollectionForm from "./CollectionForm";
import CollectionList from "./CollectionList";
import DeleteCollectionDialog from "./DeleteCollectionDialog";
import CollectionDetailPage from "./CollectionDetailPage";
import "./CollectionsPage.css";

export default function CollectionsPage() {
  const {
    collections,
    loading,
    busy,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    clearError,
  } = useCollections();

  const [editing, setEditing] = useState<Collection | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Collection | null>(null);
  const [selectedCollection, setSelectedCollection] =
  useState<Collection | null>(null);

  async function handleSave(
    input: CreateCollectionInput | UpdateCollectionInput,
  ) {
    if (editing) {
      await updateCollection(editing.id, input);
      setEditing(null);
      return;
    }

    await createCollection(input as CreateCollectionInput);
    setCreating(false);
  }

  async function handleDelete() {
    if (!deleting) return;

    await deleteCollection(deleting.id);
    setDeleting(null);
  }
  if (selectedCollection) {
  const currentCollection =
    collections.find((item) => item.id === selectedCollection.id) ??
    selectedCollection;

  return (
    <CollectionDetailPage
      collection={currentCollection}
      onBack={() => setSelectedCollection(null)}
    />
  );
}

  return (
    <main className="collections-page">
      <header className="collections-header">
        <div>
          <p className="page-eyebrow">YOUR WISHNEST</p>
          <h1>My collections</h1>
          <p>Organize the products you want to save for later.</p>
        </div>

        {!creating && !editing && (
          <button
            type="button"
            onClick={() => {
              clearError();
              setCreating(true);
            }}
          >
            + New collection
          </button>
        )}
      </header>

      {error && (
        <div className="collections-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      {(creating || editing) && (
        <section className="collection-editor">
          <h2>{editing ? "Edit collection" : "Create a collection"}</h2>

          <CollectionForm
            key={editing?.id ?? "new"}
            collection={editing}
            existingCollections={collections}
            busy={busy}
            onSubmit={handleSave}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
              clearError();
            }}
          />
        </section>
      )}

      <section className="collections-content" aria-busy={loading}>
        {loading ? (
          <p>Loading collections...</p>
        ) : (
          <>
            <div className="collections-count">
              {collections.length}{" "}
              {collections.length === 1 ? "collection" : "collections"}
            </div>

            <CollectionList
              collections={collections}
              busy={busy}
              onView={(collection) => {
                clearError();
                setSelectedCollection(collection);
              }}
              onEdit={(collection) => {
                clearError();
                setCreating(false);
                setEditing(collection);
              }}
              onDelete={(collection) => {
                clearError();
                setDeleting(collection);
              }}
            />
          </>
        )}
      </section>

      {deleting && (
        <DeleteCollectionDialog
          collectionName={deleting.name}
          busy={busy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </main>
  );
}

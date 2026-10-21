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
import { useDashboardOverview } from "../../dashboard/hooks/useDashboardOverview";
import RecentProductsPreview from "../../dashboard/components/RecentProductsPreview";

export default function CollectionsPage() {
  const dashboardOverview = useDashboardOverview();

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
        onBack={() => {
          setSelectedCollection(null);
          void dashboardOverview.refresh();
        }}
      />
    );
  }

  return (
    <main className="mx-auto w-[min(100%-2rem,1100px)] pb-16 pt-10 text-[#172033] max-[600px]:pt-6">
      <header className="mb-8 flex items-start justify-between gap-6 max-[600px]:flex-col">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-bold tracking-[0.12em] text-[#5965d8]">
            YOUR WISHNEST
          </p>

          <h1 className="my-1 text-[clamp(28px,4vw,38px)] font-bold tracking-[-0.04em]">
            My collections
          </h1>

          <p className="m-0 leading-[1.6] text-[#647084]">
            Organize the products you want to save for later.
          </p>
        </div>

        {!creating && !editing && (
          <button
            type="button"
            className="shrink-0 rounded-[9px] bg-[#5965d8] px-4 py-[11px] font-semibold text-white max-[600px]:w-full"
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
        <div
          className="mb-5 flex items-center justify-between gap-3 rounded-[10px] border border-[#ffd4d4] bg-[#fff6f6] px-4 py-3 text-[#b42332] max-[480px]:items-start"
          role="alert"
        >
          <p className="m-0 min-w-0 break-words">{error}</p>

          <button
            type="button"
            className="shrink-0 rounded-[9px] bg-[#5965d8] px-3 py-2 font-semibold text-white"
            onClick={clearError}
          >
            Dismiss
          </button>
        </div>
      )}

      {(creating || editing) && (
        <section className="mb-7 max-w-[640px] rounded-2xl border border-[#e3e7ef] bg-white p-[22px] max-[380px]:p-4">
          <h2 className="mb-5 text-xl font-semibold">
            {editing ? "Edit collection" : "Create a collection"}
          </h2>

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

      <section aria-busy={loading}>
        {loading ? (
          <p className="py-6 text-sm text-[#647084]">
            Loading collections...
          </p>
        ) : (
          <>
            <div className="mb-4 text-sm text-[#647084]">
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

      <RecentProductsPreview
        products={dashboardOverview.recentProducts}
        loading={dashboardOverview.loading}
        error={dashboardOverview.error}
        onRetry={() => void dashboardOverview.refresh()}
        onOpenCollection={(collectionId) => {
          const collection = collections.find(
            (item) => item.id === collectionId,
          );

          if (collection) setSelectedCollection(collection);
        }}
      />

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
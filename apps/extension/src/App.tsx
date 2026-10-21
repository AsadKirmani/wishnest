import { useState } from "react";
import { useAuth } from "./features/auth/hooks/useAuth";
import AuthForm from "./features/auth/components/AuthForm";
import ProductCaptureForm from "./features/products/components/ProductCaptureForm";
import ProductCollectionSelector from "./features/products/components/ProductCollectionSelector";
import Dashboard from "./features/dashboard/components/Dashboard";
import CollectionDetail from "./features/dashboard/components/CollectionDetail";
import { extractProductFromActiveTab } from "./features/products/services/productExtractor";
import type { ProductDraft } from "./features/products/types";
import CollectionForm from "./features/collections/components/CollectionForm";
import { collectionRepository } from "./features/collections/services/collectionRepository";
import type { UserCollection } from "./features/collections/services/collectionRepository";
import type { CreateCollectionInput } from "@wishnest/shared";

export default function App() {
  const auth = useAuth();

  const [productDraft, setProductDraft] = useState<ProductDraft | null>(null);
  const [captureBusy, setCaptureBusy] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [selectingCollection, setSelectingCollection] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [existingCollections, setExistingCollections] = useState<
    UserCollection[]
  >([]);
  const [collectionBusy, setCollectionBusy] = useState(false);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [dashboardKey, setDashboardKey] = useState(0);

  async function handleCaptureProduct() {
    setCaptureBusy(true);
    setCaptureError(null);
    setSaveMessage(null);

    try {
      const product = await extractProductFromActiveTab();
      setProductDraft(product);
    } catch (err) {
      setCaptureError(
        err instanceof Error ? err.message : "Could not capture this product.",
      );
    } finally {
      setCaptureBusy(false);
    }
  }

  async function handleOpenCollectionForm() {
    setCollectionError(null);
    setCollectionLoading(true);

    try {
      const collections = await collectionRepository.getAll();
      setExistingCollections(collections);
      setShowCollectionForm(true);
    } catch (err) {
      setCaptureError(
        err instanceof Error ? err.message : "Could not load your collections.",
      );
    } finally {
      setCollectionLoading(false);
    }
  }

  async function handleCreateCollection(input: CreateCollectionInput) {
    setCollectionBusy(true);
    setCollectionError(null);

    try {
      await collectionRepository.create(input);

      setShowCollectionForm(false);
      setDashboardKey((current) => current + 1);
      setSaveMessage("Collection created successfully.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not create the collection.";

      setCollectionError(message);
      throw err;
    } finally {
      setCollectionBusy(false);
    }
  }

  if (auth.loading) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-[#657089]">
        <div className="flex items-center gap-3" role="status">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#d9deea] border-t-[#243b80] motion-reduce:animate-none" />
          Loading WishNest...
        </div>
      </main>
    );
  }

  if (!auth.session) {
    return (
      <AuthForm
        busy={auth.busy}
        error={auth.error}
        message={auth.message}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
        onClearFeedback={auth.clearFeedback}
      />
    );
  }

  if (productDraft && selectingCollection) {
    return (
      <ProductCollectionSelector
        product={productDraft}
        initialCollectionId={selectedCollectionId}
        onBack={() => setSelectingCollection(false)}
        onSaved={() => {
          setProductDraft(null);
          setSelectingCollection(false);
          setSaveMessage("Product saved to your collection.");
          setCaptureError(null);
        }}
      />
    );
  }

  if (productDraft) {
    return (
      <ProductCaptureForm
        initialProduct={productDraft}
        busy={false}
        onSubmit={async (product) => {
          setProductDraft(product);
          setSelectingCollection(true);
          setCaptureError(null);
          setSaveMessage(null);
        }}
        onCancel={() => {
          setProductDraft(null);
          setCaptureError(null);
        }}
      />
    );
  }

  if (showCollectionForm) {
    return (
      <>
        <CollectionForm
          existingCollections={existingCollections}
          busy={collectionBusy}
          onSubmit={handleCreateCollection}
          onCancel={() => {
            setShowCollectionForm(false);
            setCollectionError(null);
          }}
        />

        {collectionLoading && (
          <p
            className="m-0 px-[18px] pb-3.5 text-xs text-[#657089]"
            role="status"
          >
            Loading collections...
          </p>
        )}

        {collectionError && (
          <div
            className="mx-[18px] mb-3.5 rounded-[10px] border border-[#f1caca] bg-[#fff4f4] px-3 py-2.5 text-xs text-[#a52b35] [overflow-wrap:anywhere]"
            role="alert"
          >
            {collectionError}
          </div>
        )}
      </>
    );
  }

  if (selectedCollectionId) {
    return (
      <CollectionDetail
        collectionId={selectedCollectionId}
        onBack={() => setSelectedCollectionId(null)}
        onCaptureProduct={() => void handleCaptureProduct()}
        captureBusy={captureBusy}
        captureError={captureError}
        saveMessage={saveMessage}
      />
    );
  }

  return (
    <>
      <Dashboard
        email={auth.session.user.email ?? ""}
        captureBusy={captureBusy}
        key={dashboardKey}
        onCreateCollection={() => void handleOpenCollectionForm()}
        onCaptureProduct={handleCaptureProduct}
        onLogout={() => void auth.signOut()}
        onOpenCollection={setSelectedCollectionId}
      />

      {captureError && (
        <div
          className="mx-[18px] mb-3.5 rounded-[10px] border border-[#f1caca] bg-[#fff4f4] px-3 py-2.5 text-xs text-[#a52b35] [overflow-wrap:anywhere]"
          role="alert"
        >
          {captureError}
        </div>
      )}

      {saveMessage && (
        <div
          className="mx-[18px] mb-3.5 rounded-[10px] border border-[#c9e8d5] bg-[#effaf3] px-3 py-2.5 text-xs text-[#247544] [overflow-wrap:anywhere]"
          role="status"
        >
          {saveMessage}
        </div>
      )}
    </>
  );
}
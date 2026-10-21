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
import "./App.css";

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

  if (auth.loading) {
    return <main className="app-loading">Loading WishNest...</main>;
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

        {collectionLoading && <p role="status">Loading collections...</p>}

        {collectionError && (
          <div className="app-feedback-error" role="alert">
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
        <div className="app-feedback-error" role="alert">
          {captureError}
        </div>
      )}

      {saveMessage && (
        <div className="app-feedback-success" role="status">
          {saveMessage}
        </div>
      )}
    </>
  );
}


import { useState } from "react";
import { useAuth } from "./features/auth/hooks/useAuth";
import AuthForm from "./features/auth/components/AuthForm";
import ProductCaptureForm from "./features/products/components/ProductCaptureForm";
import ProductCollectionSelector from "./features/products/components/ProductCollectionSelector";
import Dashboard from "./features/dashboard/components/Dashboard";
import CollectionDetail from "./features/dashboard/components/CollectionDetail";
import { extractProductFromActiveTab } from "./features/products/services/productExtractor";
import type { ProductDraft } from "./features/products/types";
import "./App.css";

export default function App() {
  const auth = useAuth();

  const [productDraft, setProductDraft] = useState<ProductDraft | null>(null);
  const [captureBusy, setCaptureBusy] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [selectingCollection, setSelectingCollection] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(
    null,
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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

  if (productDraft && selectingCollection) {
    return (
      <ProductCollectionSelector
        product={productDraft}
        onBack={() => setSelectingCollection(false)}
        onSaved={() => {
          setProductDraft(null);
          setSelectingCollection(false);
          setSelectedCollectionId(null);
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

  if (selectedCollectionId) {
    return (
      <CollectionDetail
        collectionId={selectedCollectionId}
        onBack={() => setSelectedCollectionId(null)}
      />
    );
  }

  return (
    <>
      <Dashboard
        email={auth.session.user.email ?? ""}
        captureBusy={captureBusy}
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

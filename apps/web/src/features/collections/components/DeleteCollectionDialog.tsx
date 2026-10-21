
interface DeleteCollectionDialogProps {
  collectionName: string;
  busy: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteCollectionDialog({
  collectionName,
  busy,
  onConfirm,
  onCancel,
}: DeleteCollectionDialogProps) {
  return (
    <div className="dialog-backdrop">
      <section
        className="delete-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <h2 id="delete-dialog-title">Delete collection?</h2>

        <p id="delete-dialog-description">
          Are you sure you want to delete <strong>{collectionName}</strong>?
          This action cannot be undone.
        </p>

        <div className="form-actions">
          <button
            type="button"
            className="button-danger"
            disabled={busy}
            onClick={() => void onConfirm()}
          >
            {busy ? "Deleting..." : "Delete collection"}
          </button>

          <button
            type="button"
            className="button-secondary"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}

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
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-900/50 p-5">
      <section
        className="w-full max-w-[440px] rounded-2xl bg-white p-6 text-[#172033] shadow-[0_24px_80px_rgb(15_23_42_/_22%)]"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <h2
          id="delete-dialog-title"
          className="mb-3 text-xl font-semibold"
        >
          Delete collection?
        </h2>

        <p
          id="delete-dialog-description"
          className="mb-6 leading-[1.6] text-[#647084]"
        >
          Are you sure you want to delete{" "}
          <strong className="font-semibold text-[#172033]">
            {collectionName}
          </strong>
          ? This action cannot be undone.
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            className="rounded-[9px] bg-[#fff0f0] px-4 py-[11px] font-semibold text-[#b42332] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={busy}
            onClick={() => void onConfirm()}
          >
            {busy ? "Deleting..." : "Delete collection"}
          </button>

          <button
            type="button"
            className="rounded-[9px] bg-[#eef0f6] px-4 py-[11px] font-semibold text-[#30394c] disabled:cursor-not-allowed disabled:opacity-60"
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
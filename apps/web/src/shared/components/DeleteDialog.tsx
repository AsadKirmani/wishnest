
interface DeleteDialogProps {
  title: string;
  description: string;
  itemName?: string;
  confirmText?: string;
  busy: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteDialog({
  title,
  description,
  itemName,
  confirmText = "Delete",
  busy,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  return (
    <section
      className="text-[#172033]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-6"
          aria-hidden="true"
        >
          <path
            d="M3 6h18M8 6V4h8v2m-11 0 1 14h12l1-14M10 10v6m4-6v6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2
        id="delete-dialog-title"
        className="mb-3 text-xl font-semibold"
      >
        {title}
      </h2>

      <p
        id="delete-dialog-description"
        className="mb-6 leading-[1.6] text-[#647084]"
      >
        {description}{" "}
        {itemName && (
          <strong className="break-words font-semibold text-[#172033]">
            {itemName}
          </strong>
        )}
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="rounded-[9px] border border-[#e3e7ef] bg-white px-4 py-[11px] font-semibold text-[#30394c] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="button"
          className="rounded-[9px] bg-red-600 px-4 py-[11px] font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy}
          onClick={() => void onConfirm()}
        >
          {busy ? "Deleting..." : confirmText}
        </button>
      </div>
    </section>
  );
}

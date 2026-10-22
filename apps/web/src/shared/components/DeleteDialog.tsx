import { Trash } from "lucide-react";

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
      className="text-content"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
        <Trash className="size-6" aria-hidden="true" />
      </div>

      <h2
        id="delete-dialog-title"
        className="mb-3 text-xl font-semibold"
      >
        {title}
      </h2>

      <p
        id="delete-dialog-description"
        className="mb-6 leading-[1.6] text-content-muted"
      >
        {description}{" "}
        {itemName && (
          <strong className="break-words font-semibold text-content">
            {itemName}
          </strong>
        )}
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="rounded-[9px] border border-border bg-surface px-4 py-[11px] font-semibold text-content transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="button"
          className="rounded-[9px] bg-primary px-4 py-[11px] font-semibold text-on-primary transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy}
          onClick={() => void onConfirm()}
        >
          {busy ? "Deleting..." : confirmText}
        </button>
      </div>
    </section>
  );
}
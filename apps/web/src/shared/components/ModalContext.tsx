import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface ModalOptions {
  title?: string;
  maxWidth?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

interface ModalState {
  content: ReactNode;
  options: ModalOptions;
}

interface ModalContextValue {
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const openModal = useCallback(
    (content: ReactNode, options: ModalOptions = {}) => {
      setModal({ content, options });
    },
    [],
  );

  useEffect(() => {
    if (!modal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        modal?.options.closeOnEscape !== false
      ) {
        closeModal();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modal, closeModal]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {modal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              modal.options.closeOnBackdrop !== false
            ) {
              closeModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={modal.options.title ?? "Dialog"}
            className={`relative my-auto max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-2xl bg-surface p-6 shadow-2xl max-[480px]:p-4 ${
              modal.options.maxWidth ?? "max-w-[640px]"
            }`}
          >
            <button
              type="button"
              aria-label="Close dialog"
              onClick={closeModal}
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="size-6" aria-hidden="true" />
            </button>

            {modal.content}
          </section>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used inside ModalProvider.");
  }

  return context;
}


import { useEffect, useRef, useState } from "react";
import { UserRound, LogOut } from "lucide-react";
import CollectionsPage from "../../collections/components/CollectionsPage";
import { ModalProvider } from "../../../shared/components/ModalContext";

interface DashboardLayoutProps {
  email: string;
  busy: boolean;
  error: string | null;
  message: string | null;
  onLogout: () => void | Promise<void>;
}

export default function DashboardLayout({
  email,
  busy,
  error,
  message,
  onLogout,
}: DashboardLayoutProps) {
  const [hideErrorAndMessage, setHideErrorAndMessage] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!error && !message) {
      setHideErrorAndMessage(false);
      return;
    }

    setHideErrorAndMessage(false);

    const timer = setTimeout(() => {
      setHideErrorAndMessage(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, message]);

  useEffect(() => {
    if (!accountMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  async function handleLogout() {
    setAccountMenuOpen(false);
    await onLogout();
  }

  return (
    <div className="min-h-screen bg-background text-content">
      <header className="sticky left-0 top-0 z-50 flex min-h-[72px] items-center justify-between gap-4 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-md min-[601px]:px-6 min-[1100px]:px-[max(24px,calc((100vw-1100px)/2))]">
        <a
          className="inline-flex shrink-0 items-center gap-0.5 text-xl font-bold tracking-[-0.04em] text-content no-underline"
          href="/"
          aria-label="WishNest home"
        >
          <span className="grid size-[34px] place-items-center rounded-[10px] bg-primary text-on-primary">
            W
          </span>
          <span>ishNest</span>
        </a>

        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
            className="flex size-10 cursor-pointer items-center justify-center gap-1 rounded-xl border border-border bg-surface text-content transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            onClick={() => setAccountMenuOpen((open) => !open)}
          >
            <UserRound className="size-5 text-primary" aria-hidden="true" />
            
          </button>

          {accountMenuOpen && (
            <div
              className="absolute right-0 top-[calc(100%+10px)] z-[60] w-[min(280px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
              role="menu"
            >
              <div className="border-b border-border p-4">
                <p className="mb-1 text-xs font-medium text-content-muted">
                  Signed in as
                </p>
                <p
                  className="m-0 break-all text-sm font-semibold text-content"
                  title={email}
                >
                  {email || "No email available"}
                </p>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-content transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={busy}
                  onClick={() => void handleLogout()}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {busy ? "Please wait..." : "Log out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {(error || message) && !hideErrorAndMessage && (
        <div
          className="fixed bottom-4 left-4 z-[70] w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface px-4 py-3 shadow-lg"
          aria-live="polite"
        >
          {error && (
            <p className="m-0 break-words text-sm text-primary">
              {error}
            </p>
          )}

          {message && (
            <p
              className={`${error ? "mt-1.5" : "mt-0"} mb-0 break-words text-sm text-accent`}
            >
              {message}
            </p>
          )}
        </div>
      )}

      <ModalProvider>
        <CollectionsPage />
      </ModalProvider>
    </div>
  );
}
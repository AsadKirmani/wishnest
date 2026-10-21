import CollectionsPage from "../../collections/components/CollectionsPage";

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
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="box-border flex min-h-[72px] items-center justify-between gap-5 border-b border-[#e3e7ef] bg-white px-4 py-3 min-[601px]:px-6 min-[1100px]:px-[max(24px,calc((100vw-1100px)/2))]">
        <a
          className="inline-flex shrink-0 items-center gap-2.5 text-xl font-bold tracking-[-0.04em] text-[#172033] no-underline"
          href="/"
          aria-label="WishNest home"
        >
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-[#5965d8] text-white">
            W
          </span>
          <span>WishNest</span>
        </a>

        <div className="flex min-w-0 items-center gap-2 min-[601px]:gap-4">
          <span
            className="max-w-[125px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#647084] min-[601px]:max-w-[260px]"
            title={email}
          >
            {email}
          </span>

          <button
            type="button"
            className="shrink-0 cursor-pointer rounded-[9px] border border-[#d9deea] bg-white px-[13px] py-[9px] text-[13px] font-semibold text-[#30394c] transition-colors hover:bg-[#f1f3f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5965d8] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={busy}
            onClick={() => void onLogout()}
          >
            {busy ? "Please wait..." : "Log out"}
          </button>
        </div>
      </header>

      {(error || message) && (
        <div
          className="mx-auto mt-5 box-border w-[calc(100%-32px)] max-w-[1100px] rounded-[10px] border border-[#e3e7ef] bg-white px-4 py-3"
          aria-live="polite"
        >
          {error && (
            <p className="m-0 [overflow-wrap:anywhere] text-sm text-[#b42332]">
              {error}
            </p>
          )}

          {message && (
            <p
              className={`${error ? "mt-1.5" : "mt-0"} mb-0 [overflow-wrap:anywhere] text-sm text-[#16794b]`}
            >
              {message}
            </p>
          )}
        </div>
      )}

      <CollectionsPage />
    </div>
  );
}
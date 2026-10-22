
type AccountPanelProps = {
  email: string;
  busy: boolean;
  error: string;
  message: string;
  onLogout: () => Promise<void>;
};

export default function AccountPanel({
  email,
  busy,
  error,
  message,
  onLogout,
}: AccountPanelProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-3 text-content min-[381px]:p-5">
      <section className="box-border w-full max-w-[400px] rounded-2xl border border-border bg-surface p-5 shadow-lg min-[381px]:p-7">
        <h1 className="mb-2 mt-0 text-[28px] font-bold">
          WishNest
        </h1>

        <p className="text-content-muted">
          Save it. Organize it. Share it.
        </p>

        <div className="my-6 flex items-start gap-3 rounded-[10px] bg-secondary p-3.5 [overflow-wrap:anywhere]">
          <span
            className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full bg-accent"
            aria-hidden="true"
          />

          <div className="min-w-0">
            <strong className="text-content">
              You are logged in
            </strong>
            <p className="mt-1.5 text-content-muted">{email}</p>
          </div>
        </div>

        {error && (
          <p
            className="mb-3 [overflow-wrap:anywhere] text-sm text-primary"
            role="alert"
          >
            {error}
          </p>
        )}

        {message && (
          <p className="mb-3 text-sm text-accent" role="status">
            {message}
          </p>
        )}

        <button
          className="w-full cursor-pointer rounded-lg border-0 bg-primary p-3 font-semibold text-on-primary transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={() => void onLogout()}
          disabled={busy}
        >
          {busy ? "Please wait..." : "Log out"}
        </button>
      </section>
    </main>
  );
}

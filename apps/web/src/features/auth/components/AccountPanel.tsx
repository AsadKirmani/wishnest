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
    <main className="grid min-h-screen place-items-center p-3 min-[381px]:p-5">
      <section className="box-border w-full max-w-[400px] rounded-2xl border border-[#e5e9f2] bg-white p-5 shadow-[0_12px_35px_rgb(20_35_70_/_7%)] min-[381px]:p-7">
        <h1 className="mb-2 mt-0 text-[28px] font-bold text-[#172033]">
          WishNest
        </h1>

        <p className="text-[#657089]">
          Save it. Organize it. Share it.
        </p>

        <div className="my-6 flex items-start gap-3 rounded-[10px] bg-[#f0f4ff] p-3.5 [overflow-wrap:anywhere]">
          <span className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full bg-[#26996b]" />

          <div className="min-w-0">
            <strong className="text-[#172033]">
              You are logged in
            </strong>
            <p className="mt-1.5 text-[#657089]">{email}</p>
          </div>
        </div>

        {error && (
          <p
            className="mb-3 [overflow-wrap:anywhere] text-sm text-[#b42318]"
            role="alert"
          >
            {error}
          </p>
        )}

        {message && (
          <p className="mb-3 text-sm text-[#26996b]" role="status">
            {message}
          </p>
        )}

        <button
          className="w-full cursor-pointer rounded-lg border-0 bg-[#243b80] p-3 font-semibold text-white transition-colors hover:bg-[#1c2f69] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5269dc] disabled:cursor-not-allowed disabled:opacity-60"
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
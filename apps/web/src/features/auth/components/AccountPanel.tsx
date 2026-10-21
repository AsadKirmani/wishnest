
import "./../../../styles/auth.css";

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
    <main className="auth-shell">
      <section className="auth-card">
        <h1>WishNest</h1>
        <p>Save it. Organize it. Share it.</p>

        <div className="user-panel">
          <span className="status-dot" />

          <div>
            <strong>You are logged in</strong>
            <p>{email}</p>
          </div>
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        <button
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

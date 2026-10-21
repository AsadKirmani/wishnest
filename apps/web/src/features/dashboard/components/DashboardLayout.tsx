
import CollectionsPage from "../../collections/components/CollectionsPage";
import "./DashboardLayout.css";

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
    <div className="dashboard-layout">
      <header className="dashboard-topbar">
        <a className="dashboard-brand" href="/" aria-label="WishNest home">
          <span className="dashboard-brand-icon">W</span>
          <span>WishNest</span>
        </a>

        <div className="dashboard-account">
          <span className="dashboard-email" title={email}>
            {email}
          </span>

          <button
            type="button"
            className="dashboard-logout"
            disabled={busy}
            onClick={() => void onLogout()}
          >
            {busy ? "Please wait..." : "Log out"}
          </button>
        </div>
      </header>

      {(error || message) && (
        <div className="dashboard-feedback" aria-live="polite">
          {error && <p className="dashboard-feedback-error">{error}</p>}
          {message && <p className="dashboard-feedback-message">{message}</p>}
        </div>
      )}

      <CollectionsPage />
    </div>
  );
}

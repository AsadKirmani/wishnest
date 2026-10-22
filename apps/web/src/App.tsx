
import { useAuth } from "./features/auth/hooks/useAuth";
import AuthForm from "./features/auth/components/AuthForm";
import DashboardLayout from "./features/dashboard/components/DashboardLayout";
import SharedCollectionPage from "./features/collections/components/SharedCollectionPage";

export default function App() {
  const auth = useAuth();
  const shareMatch = window.location.pathname.match(/^\/share\/([^/]+)\/?$/);

  if (auth.loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-sm text-content-muted">
        <div className="flex items-center gap-3" role="status">
          <span className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
          Loading WishNest...
        </div>
      </main>
    );
  }

  if (shareMatch) {
    if (auth.session) {
      return (
        <SharedCollectionPage
          token={decodeURIComponent(shareMatch[1])}
        />
      );
    }

    return (
      <AuthForm
        busy={auth.busy}
        error={auth.error}
        message={auth.message}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
        onClearFeedback={auth.clearFeedback}
      />
    );
  }

  if (auth.session) {
    return (
      <DashboardLayout
        email={auth.session.user.email ?? ""}
        busy={auth.busy}
        error={auth.error}
        message={auth.message}
        onLogout={auth.signOut}
      />
    );
  }

  return (
    <AuthForm
      busy={auth.busy}
      error={auth.error}
      message={auth.message}
      onSignIn={auth.signIn}
      onSignUp={auth.signUp}
      onClearFeedback={auth.clearFeedback}
    />
  );
}

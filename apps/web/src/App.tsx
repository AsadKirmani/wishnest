
import { useAuth } from "./features/auth/hooks/useAuth";
import AuthForm from "./features/auth/components/AuthForm";
import DashboardLayout from "./features/dashboard/components/DashboardLayout";
import "./App.css";

export default function App() {
  const auth = useAuth();

  if (auth.loading) {
    return <main className="app-loading">Loading WishNest...</main>;
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

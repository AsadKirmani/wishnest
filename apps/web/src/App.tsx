import { useAuth } from "./features/auth/hooks/useAuth";
import AuthForm from "./features/auth/components/AuthForm";
import DashboardLayout from "./features/dashboard/components/DashboardLayout";

export default function App() {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f7fb] text-sm text-[#657089]">
        <div className="flex items-center gap-3" role="status">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#d9deea] border-t-[#243b80] motion-reduce:animate-none" />
          Loading WishNest...
        </div>
      </main>
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
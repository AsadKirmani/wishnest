
import { useState, type FormEvent } from "react";
import "./../../../styles/auth.css";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  busy: boolean;
  error: string;
  message: string;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onClearFeedback: () => void;
};

export default function AuthForm({
  busy,
  error,
  message,
  onSignIn,
  onSignUp,
  onClearFeedback,
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    onClearFeedback();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "signup") {
      await onSignUp(email, password);
    } else {
      await onSignIn(email, password);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1>WishNest</h1>
        <p>Save it. Organize it. Share it.</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
          >
            Log in
          </button>

          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => changeMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            required
          />

          {error && <p className="error" role="alert">{error}</p>}
          {message && <p role="status">{message}</p>}

          <button type="submit" disabled={busy}>
            {busy
              ? "Please wait..."
              : mode === "signup"
                ? "Create account"
                : "Log in"}
          </button>
        </form>
      </section>
    </main>
  );
}

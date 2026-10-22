
import { useState, type FormEvent } from "react";

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

  const inputClasses =
    "mb-2 box-border w-full rounded-lg border border-border bg-surface p-3 text-sm text-content placeholder:text-content-muted focus:border-primary focus:outline-2 focus:outline-accent focus:outline-offset-1";

  const buttonBase =
    "cursor-pointer rounded-lg border-0 p-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="grid min-h-screen place-items-center bg-background p-3 text-content min-[381px]:p-5">
      <section className="box-border w-full max-w-[400px] rounded-2xl border border-border bg-surface p-5 shadow-lg min-[381px]:p-7">
        <h1 className="mb-2 mt-0 text-[28px] font-bold">
          WishNest
        </h1>

        <p className="text-content-muted">
          Save it. Organize it. Share it.
        </p>

        <div className="my-6 flex gap-2">
          <button
            type="button"
            className={`${buttonBase} flex-1 ${
              mode === "login"
                ? "bg-primary text-on-primary"
                : "bg-secondary text-content hover:bg-accent"
            }`}
            onClick={() => changeMode("login")}
            aria-pressed={mode === "login"}
          >
            Log in
          </button>

          <button
            type="button"
            className={`${buttonBase} flex-1 ${
              mode === "signup"
                ? "bg-primary text-on-primary"
                : "bg-secondary text-content hover:bg-accent"
            }`}
            onClick={() => changeMode("signup")}
            aria-pressed={mode === "signup"}
          >
            Sign up
          </button>
        </div>

        <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
          <label
            className="text-sm font-semibold text-content"
            htmlFor="auth-email"
          >
            Email
          </label>

          <input
            className={inputClasses}
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <label
            className="text-sm font-semibold text-content"
            htmlFor="auth-password"
          >
            Password
          </label>

          <input
            className={inputClasses}
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

          {error && (
            <p
              className="m-0 [overflow-wrap:anywhere] text-sm text-primary"
              role="alert"
            >
              {error}
            </p>
          )}

          {message && (
            <p className="m-0 text-sm text-accent" role="status">
              {message}
            </p>
          )}

          <button
            className={`${buttonBase} bg-primary text-on-primary hover:bg-accent`}
            type="submit"
            disabled={busy}
          >
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

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
    "mb-2 box-border w-full rounded-lg border border-[#d7ddeb] bg-white p-3 text-sm text-[#172033] placeholder:text-slate-400 focus:border-[#243b80] focus:outline-2 focus:outline-[#c7d2fe] focus:outline-offset-1";

  const primaryButton =
    "cursor-pointer rounded-lg border-0 bg-[#243b80] p-3 font-semibold text-white transition-colors hover:bg-[#1c2f69] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5269dc] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="grid min-h-screen place-items-center p-3 sm:p-5">
      <section className="box-border w-full max-w-[400px] rounded-2xl border border-[#e5e9f2] bg-white p-5 shadow-[0_12px_35px_rgb(20_35_70_/_7%)] sm:p-7">
        <h1 className="mb-2 mt-0 text-[28px] font-bold text-[#172033]">
          WishNest
        </h1>
        <p className="text-[#657089]">
          Save it. Organize it. Share it.
        </p>

        <div className="my-6 flex gap-2">
          <button
            type="button"
            className={`flex-1 cursor-pointer rounded-lg border-0 p-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5269dc] ${
              mode === "login"
                ? "bg-[#243b80] text-white"
                : "bg-[#f0f2f8] text-[#303a50] hover:bg-[#e5e9f2]"
            }`}
            onClick={() => changeMode("login")}
            aria-pressed={mode === "login"}
          >
            Log in
          </button>

          <button
            type="button"
            className={`flex-1 cursor-pointer rounded-lg border-0 p-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5269dc] ${
              mode === "signup"
                ? "bg-[#243b80] text-white"
                : "bg-[#f0f2f8] text-[#303a50] hover:bg-[#e5e9f2]"
            }`}
            onClick={() => changeMode("signup")}
            aria-pressed={mode === "signup"}
          >
            Sign up
          </button>
        </div>

        <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
          <label
            className="text-sm font-semibold text-[#303a50]"
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
            className="text-sm font-semibold text-[#303a50]"
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
              className="m-0 [overflow-wrap:anywhere] text-sm text-[#b42318]"
              role="alert"
            >
              {error}
            </p>
          )}

          {message && (
            <p className="m-0 text-sm text-[#26996b]" role="status">
              {message}
            </p>
          )}

          <button className={primaryButton} type="submit" disabled={busy}>
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
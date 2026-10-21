
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabase";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;

      setSession(newSession);
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        setError(error.message);
      } else {
        setSession(data.session);
      }

      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearFeedback = useCallback(() => {
    setError("");
    setMessage("");
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setBusy(true);
      clearFeedback();

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) throw error;

        setMessage("Logged in successfully.");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setBusy(false);
      }
    },
    [clearFeedback],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      setBusy(true);
      clearFeedback();

      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) throw error;

        setMessage(
          data.session
            ? "Account created successfully."
            : "Check your email to confirm your account, then log in.",
        );
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setBusy(false);
      }
    },
    [clearFeedback],
  );

  const signOut = useCallback(async () => {
    setBusy(true);
    clearFeedback();

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setMessage("Logged out successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [clearFeedback]);

  return {
    session,
    loading,
    busy,
    error,
    message,
    signIn,
    signUp,
    signOut,
    clearFeedback,
  };
}

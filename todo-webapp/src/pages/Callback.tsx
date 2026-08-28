import { useEffect, useRef, useState } from "react";
import { handleCallback } from "../auth";

// OIDC redirect target. Calls handleCallback() exactly once on mount, then
// lands the user back at the app root (thunder-authentication skill).
export default function CallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    handleCallback()
      .then(() => {
        window.location.assign(window.location.origin);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Sign-in failed");
      });
  }, []);

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p>Sign-in failed: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <p>Signing you in…</p>
    </div>
  );
}

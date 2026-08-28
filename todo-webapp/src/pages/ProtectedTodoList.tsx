import { useEffect, useState } from "react";
import type { User } from "oidc-client-ts";
import { currentUser, signIn } from "../auth";
import TodoList from "./TodoList";

// Gates rendering on currentUser(): a signed-in user renders the app, a null
// (no session, silent renew failed too) starts a fresh sign-in redirect.
export default function ProtectedTodoList() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    currentUser().then((u) => {
      if (cancelled) return;
      if (u) {
        setUser(u);
      } else {
        void signIn();
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (user === undefined) {
    return (
      <div style={{ padding: 24 }}>
        <p>Loading…</p>
      </div>
    );
  }

  if (user === null) {
    return (
      <div style={{ padding: 24 }}>
        <p>Redirecting to sign in…</p>
      </div>
    );
  }

  return <TodoList user={user} />;
}

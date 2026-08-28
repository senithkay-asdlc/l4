import { useEffect, useMemo, useState } from "react";
import type { User } from "oidc-client-ts";
import { todoApi } from "../api";
import type { components } from "../generated/todo-api";

type Todo = components["schemas"]["Todo"];
type Filter = "all" | "active" | "completed";

// The gateway/backend injects the caller's real identity from the bearer
// token; a client-supplied X-User-Id is never trusted (api-management skill).
// The value here is a placeholder to satisfy the required-but-injected header.
const INJECTED_HEADER = { "X-User-Id": "" };

function displayName(user: User): string {
  const profile = user.profile as Record<string, unknown>;
  const name = profile.name ?? profile.email ?? profile.preferred_username;
  return typeof name === "string" && name.length > 0 ? name : "User";
}

export default function TodoList({ user }: { user: User }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [newTodoText, setNewTodoText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadTodos() {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await todoApi.GET("/todos", {
      params: { header: INJECTED_HEADER, query: { limit: 100 } },
    });
    if (error) {
      setLoadError(error.message);
    } else if (data) {
      setTodos(data.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadTodos();
  }, []);

  const counts = useMemo(() => {
    const active = todos.filter((t) => !t.completed).length;
    const completed = todos.filter((t) => t.completed).length;
    return { all: todos.length, active, completed };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    const text = newTodoText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    const { data, error } = await todoApi.POST("/todos", {
      params: { header: INJECTED_HEADER },
      body: { text },
    });
    if (!error && data) {
      setTodos((prev) => [data, ...prev]);
      setNewTodoText("");
    }
    setSubmitting(false);
  }

  async function handleComplete(todoId: string) {
    const { data, error } = await todoApi.PATCH("/todos/{todoId}/complete", {
      params: { header: INJECTED_HEADER, path: { todoId } },
    });
    if (!error && data) {
      setTodos((prev) => prev.map((t) => (t.id === todoId ? data : t)));
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar-brand">TodoApp</span>
      </nav>

      <main className="content">
        <div className="row row-heading">
          <h1>My Todos</h1>
          <div className="spacer" />
          <div className="avatar" title={displayName(user)}>
            {initials(displayName(user))}
          </div>
        </div>

        <form className="row row-add" onSubmit={handleAddTodo}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            Add todo
          </button>
        </form>

        <div className="row row-badges">
          <button
            className={`badge ${filter === "all" ? "badge-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({counts.all})
          </button>
          <button
            className={`badge badge-info ${filter === "active" ? "badge-active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Active ({counts.active})
          </button>
          <button
            className={`badge badge-success ${filter === "completed" ? "badge-active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed ({counts.completed})
          </button>
        </div>

        {loadError && <p className="error">Could not load todos: {loadError}</p>}
        {loading ? (
          <p>Loading todos…</p>
        ) : (
          <table className="todo-table">
            <thead>
              <tr>
                <th>Todo</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleTodos.map((todo) => (
                <tr key={todo.id}>
                  <td>{todo.text}</td>
                  <td>
                    <span className={`status ${todo.completed ? "status-done" : "status-open"}`}>
                      {todo.completed ? "Completed" : "Open"}
                    </span>
                  </td>
                  <td>
                    {!todo.completed && (
                      <button className="link-action" onClick={() => handleComplete(todo.id)}>
                        Mark complete →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {visibleTodos.length === 0 && (
                <tr>
                  <td colSpan={3} className="empty">
                    No todos here yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const chars = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return chars.join("") || "U";
}

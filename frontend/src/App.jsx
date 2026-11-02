import { useEffect, useState } from "react";

// IMPORTANT: relative path, NOT a hardcoded IP.
// The browser sends this to whatever address it loaded the page from
// (the ALB), and the ALB forwards /api/* to the backend.
const API = "/api/tasks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error();
      setTasks(await res.json());
      setError("");
    } catch {
      setError("Can't reach the server. Check that the backend is running.");
    }
  }

  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    load();
  }

  async function toggle(id) {
    await fetch(`${API}/${id}`, { method: "PATCH" });
    load();
  }

  async function remove(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    load();
  }

  const left = tasks.filter((t) => !t.done).length;

  return (
    <main>
      <h1>Task Tracker (v4)</h1>
      <p className="sub">{tasks.length ? `${left} of ${tasks.length} left to do` : "Nothing yet"}</p>

      <form onSubmit={add}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          aria-label="New task"
        />
        <button type="submit">Add task</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul>
        {tasks.map((t) => (
          <li key={t.id} className={t.done ? "done" : ""}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              <span>{t.title}</span>
            </label>
            <button className="ghost" onClick={() => remove(t.id)} aria-label={`Delete ${t.title}`}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {!tasks.length && !error && <p className="empty">Add your first task above.</p>}
    </main>
  );
}

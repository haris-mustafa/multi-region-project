const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "tasks",
  // RDS usually needs SSL. Set DB_SSL=true on AWS.
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Create the table if it doesn't exist (retry until DB is ready)
async function initDb(retries = 15) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          done BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`);
      console.log("Database ready");
      return;
    } catch (err) {
      console.log(`DB not ready (${i}/${retries}): ${err.message}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  console.error("Could not connect to the database");
  process.exit(1);
}

// ALB health check hits this
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "db down" });
  }
});

app.get("/api/tasks", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
  res.json(rows);
});

app.post("/api/tasks", async (req, res) => {
  const title = (req.body.title || "").trim();
  if (!title) return res.status(400).json({ error: "Title is required" });
  const { rows } = await pool.query(
    "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
    [title]
  );
  res.status(201).json(rows[0]);
});

app.patch("/api/tasks/:id", async (req, res) => {
  const { rows } = await pool.query(
    "UPDATE tasks SET done = NOT done WHERE id = $1 RETURNING *",
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

app.delete("/api/tasks/:id", async (req, res) => {
  await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

const PORT = process.env.PORT || 5000;
initDb().then(() => app.listen(PORT, () => console.log(`API on ${PORT}`)));

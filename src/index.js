const express = require("express");
const pool = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const HOST = "0.0.0.0";

// אם תשתמש ב-JSON בעתיד
app.use(express.json());

async function ensureSchema(retries = 30, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS visits (
          id SERIAL PRIMARY KEY,
          ts TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      return;
    } catch (err) {
      console.log("DB not ready yet:", err.message);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error("Database never became ready");
}

app.get("/", async (_req, res, next) => {
  try {
    await pool.query("INSERT INTO visits DEFAULT VALUES;");
    const { rows } = await pool.query(
      "SELECT COUNT(*)::int AS count FROM visits;"
    );
    res.type("text/plain").send(
      `Hello from Node.js + PostgreSQL! Total visits: ${rows[0].count}\n`
    );
  } catch (e) {
    next(e);
  }
});

app.get("/stats", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT COUNT(*)::int AS count FROM visits;"
    );
    res.json({ visits: rows[0].count });
  } catch (e) {
    next(e);
  }
});

// healthcheck אמיתי מול הדאטהבייס
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1;");
    res.status(200).send("OK");
  } catch {
    res.status(503).send("DB not ready");
  }
});

// error handler מרוכז
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

let server;
ensureSchema()
  .then(() => {
    server = app.listen(PORT, HOST, () =>
      console.log(`App listening on http://${HOST}:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to init DB:", err);
    process.exit(1);
  });

// כיבוי אלגנטי
async function shutdown(signal) {
  try {
    console.log(`\n${signal} received, shutting down...`);
    if (server) {
      await new Promise((res) => server.close(res));
    }
    await pool.end();
    process.exit(0);
  } catch (e) {
    console.error("Shutdown error:", e);
    process.exit(1);
  }
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { logsRouter } from "./routes/logs.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDist = join(__dirname, "..", "client", "dist");

export function createApp() {
  const app = express();

  app.use(express.static(clientDist));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(express.json({ limit: "1mb" }));

  app.use("/logs", logsRouter);

  app.use((err, _req, res, _next) => {
    const status = err.status ?? err.statusCode ?? 500;
    const message =
      err.message && status !== 500 ? err.message : "Internal Server Error";
    res.status(status).json({ error: message });
  });

  return app;
}
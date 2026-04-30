import { Router } from "express";

export const logsRouter = Router();

logsRouter.post("/", (req, res) => {
  res.status(201).json({
    ok: true,
    receivedAt: new Date().toISOString(),
  });
});

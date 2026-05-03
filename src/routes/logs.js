import { Router } from "express";
import { redis } from "../redis.js";
import { indexLog } from "../elasticsearch.js";

export const logsRouter = Router();

// Logs arrive in pairs — exactly two POST requests will ever share the same TransactionId.
// The first is held in Redis until the second arrives, at which point they are merged and returned.
// TODO: If a log reaches its timeout without being paired, it should be marked and then persisted instead of being lost.
logsRouter.post("/", async (req, res, next) => {
  try {
    const { TransactionId } = req.body;

    if (!TransactionId) {
      return res.status(400).json({ error: "TransactionId is required" });
    }

    const redisKey = `log:${TransactionId}`;

    // SET GET NX — atomic in one round-trip:
    // - key absent: stores value, returns null (first log)
    // - key present: does not overwrite, returns existing value (second log)
    const existingLog = await redis.set(redisKey, JSON.stringify(req.body), "GET", "NX", "EX", 300);

    if (existingLog === null) {
      // The key doesn't exist, so this is the first log
      // TODO: This system is not designed to handle high transaction volume, otherwise the older log might get lost due to eviction.
      return res.status(202).json({ ok: true, status: "partial" });
    }

    // Second log — merge and delete the key
    await redis.del(redisKey);

    const firstLog = JSON.parse(existingLog);

    const mergedLog = { ...firstLog, ...req.body }; // second log wins on duplicate keys

    await indexLog(mergedLog);

    res.status(201).json({ ok: true, status: "complete", log: mergedLog });
  } catch (error) {
    next(error);
  }
});

import Redis from "ioredis";
import { indexLog } from "./elasticsearch.js";
import { ReplyError } from "ioredis";

const STREAM = "logs:stream";
const GROUP = "es-indexers";
const WORKER_COUNT = 5;

async function createGroup() {
  // Use a short-lived connection just for setup
  const redis = new Redis(process.env.REDIS_URL);
  try {
    // MKSTREAM creates the stream if it doesn't exist yet
    await redis.xgroup("CREATE", STREAM, GROUP, "$", "MKSTREAM");
    console.log(`Consumer group "${GROUP}" created`);
  } catch (err) {
    // BUSYGROUP means the group already exists — safe to ignore on restart
    if (!(err instanceof ReplyError && err.message.startsWith("BUSYGROUP"))) throw err;
  } finally {
    await redis.quit();
  }
}

// On startup, reclaim messages that were delivered but never ACKed before the last crash.
// Runs once per worker before entering the normal read loop.
async function reclaimPending(redis, consumer) {
  let cursor = "0-0";
  let reclaimed = 0;

  do {
    // Reclaim messages idle for more than 60 s and reassign them to this consumer
    const [nextCursor, messages] = await redis.xautoclaim(
      STREAM, GROUP, consumer,
      60000,   // idle threshold, only reclaim messages that have been idle for more than 60 seconds
      cursor
    );

    for (const [id, fields] of messages) {
      const log = JSON.parse(fields[1]);
      await indexLog(log);
      await redis.xack(STREAM, GROUP, id);
      reclaimed++;
    }

    cursor = nextCursor;
  } while (cursor !== "0-0"); // "0-0" means the full PEL has been scanned

  if (reclaimed > 0) {
    console.log(`Worker ${consumer} reclaimed ${reclaimed} pending message(s) on startup`);
  }
}

async function runWorker(id) {
  // Each worker needs its own connection — BLOCK holds the connection open
  const redis = new Redis(process.env.REDIS_URL);
  const consumer = `worker-${id}`;

  await reclaimPending(redis, consumer);

  while (true) {
    try {
      // ">" delivers only new messages not yet assigned to any consumer
      const results = await redis.xreadgroup(
        "GROUP", GROUP, consumer,
        "BLOCK", "5000",  // wait up to 5 s for a message before looping
        "COUNT", "1",
        "STREAMS", STREAM, ">"
      );

      if (!results) continue; // timeout with no messages — loop

      const [, messages] = results[0];
      for (const [id, fields] of messages) {
        // fields = ["log", "{...json...}"]
        const log = JSON.parse(fields[1]);
        await indexLog(log);
        await redis.xack(STREAM, GROUP, id);
      }
    } catch (err) {
      console.error(`Worker ${id} error:`, err.message);
      await new Promise((r) => setTimeout(r, 60 * 1000)); // back off before retrying
    }
  }
}

export async function startWorkers() {
  await createGroup();
  console.log(`Starting ${WORKER_COUNT} stream workers`);
  for (let i = 1; i <= WORKER_COUNT; i++) {
    runWorker(i); // intentionally not awaited — each loop runs concurrently
  }
}

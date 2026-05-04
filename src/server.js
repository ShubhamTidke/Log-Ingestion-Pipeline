import { createApp } from "./app.js";
import { startWorkers } from "./worker.js";

const port = Number(process.env.PORT) || 3000;
const app = createApp();

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

// Start the worker threads to index the logs to Elasticsearch from Redis streams.
startWorkers();

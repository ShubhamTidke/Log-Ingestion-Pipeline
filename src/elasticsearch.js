import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({ node: process.env.ELASTICSEARCH_URL });

esClient.info()
  .then(() => console.log("Elasticsearch connected"))
  .catch((err) => console.error("Elasticsearch error:", err));

export async function indexLog(log) {
  await esClient.index({ index: "transaction-logs", document: log });
}

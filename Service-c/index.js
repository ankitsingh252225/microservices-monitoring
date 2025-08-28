// index.js
import express from "express";
import { client, connectRedis } from "./redisClientC.js";
import promClient from "prom-client";

const app = express();
const PORT = 4200;

// Prometheus metrics
const totalJobsSubmitted = new promClient.Gauge({
  name: "total_jobs_submitted",
  help: "Total number of jobs submitted"
});

const totalJobsCompleted = new promClient.Gauge({
  name: "total_jobs_completed",
  help: "Total number of jobs completed"
});

const queueLengthGauge = new promClient.Gauge({
  name: "queue_length",
  help: "Current length of job queue"
});

const avgProcessingTime = new promClient.Gauge({
  name: "avg_job_processing_time_seconds",
  help: "Average time taken to process jobs"
});

// /stats endpoint
app.get("/stats", async (req, res) => {
  try {
    const jobIds = await client.lRange("submittedJobs", 0, -1);
    const queueLength = await client.lLen("jobQueue");

    let completed = 0;
    let totalTime = 0;

    for (const id of jobIds) {
      const status = await client.get(`jobStatus:${id}`);
      if (status === "completed") {
        completed++;
        const result = await client.get(`jobResult:${id}`);
        const match = result?.match(/([\d.]+)s/);
        if (match) totalTime += parseFloat(match[1]);
      }
    }

    const avgTime = completed > 0 ? totalTime / completed : 0;

    res.json({
      totalJobs: jobIds.length,
      completed,
      queueLength,
      avgProcessingTime: avgTime.toFixed(3)
    });
  } catch (err) {
    console.error("❌ Error in /stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// /metrics endpoint
app.get("/metrics", async (req, res) => {
  try {
    const jobIds = await client.lRange("submittedJobs", 0, -1);
    const queueLength = await client.lLen("jobQueue");

    let completed = 0;
    let totalTime = 0;

    for (const id of jobIds) {
      const status = await client.get(`jobStatus:${id}`);
      if (status === "completed") {
        completed++;
        const result = await client.get(`jobResult:${id}`);
        const match = result?.match(/([\d.]+)s/);
        if (match) totalTime += parseFloat(match[1]);
      }
    }

    totalJobsSubmitted.set(jobIds.length);
    totalJobsCompleted.set(completed);
    queueLengthGauge.set(queueLength);
    avgProcessingTime.set(completed > 0 ? totalTime / completed : 0);

    res.set("Content-Type", promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (err) {
    console.error("❌ Error in /metrics:", err);
    res.status(500).send("Failed to generate metrics");
  }
});

// Start server
async function start() {
  await connectRedis();
 app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server C running on http://0.0.0.0:${PORT}`);
});
}

start();


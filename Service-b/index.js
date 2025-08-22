import {
  calculatePrimes,
  bcryptHash,
  generateAndSortArray,
} from "./cpuTask.js";
import express from "express";
import client from "./redisClientB.js";
import promClient from "prom-client";

const app = express();
const PORT = 4000;

const jobsProcessed = new promClient.Counter({
  name: "jobs_processed_total",
  help: "Total number of jobs processed",
});

const jobErrors = new promClient.Counter({
  name: "job_errors_total",
  help: "Total number of job processing errors",
});

const jobTime = new promClient.Histogram({
  name: "job_processing_time_seconds",
  help: "Time taken to process each job",
  buckets: [0.5, 1, 2, 5, 10],
});

async function processJobs() {
  while (true) {
    try {
      const job = await client.lPop("jobQueue");
      if (!job) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      const parsed = JSON.parse(job);
      const start = Date.now();

      const taskType = parsed.payload.taskType;
      let result;

      if (taskType === "primes") {
        result = calculatePrimes();
      } else if (taskType === "sort") {
        result = generateAndSortArray();
      } else {
        result = await bcryptHash();
      }

      const duration = (Date.now() - start) / 1000;
      await client.set(`jobResult:${parsed.id}`, `done in ${duration}s`);

      jobsProcessed.inc();
      jobTime.observe(duration);
    } catch (err) {
      console.error("Job error:", err);
      jobErrors.inc();
    }
  }
}

processJobs();

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.listen(PORT, () => {
  console.log(`⚙️ Worker running on http://localhost:${PORT}`);
});

// index.js
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { client, connectRedis } from "./redisClinet.js";

const app = express();
app.use(express.json());
const PORT = 3100;

async function startServer() {
  await connectRedis();
  console.log("Redis connected, starting server...ok");
  app.use((req, res, next) => {
    console.log(" Incoming request:", req.method, req.url);
    next();
  });
  app.post("/submit", async (req, res) => {
    console.log("hite");
    try {
      const jobId = uuidv4();
      const jobData = {
        id: jobId,
        type: "cpu-heavy",
        payload: {
          taskType: req.body.payload?.taskType || "hash",
        },
      };

      await client.rPush("jobQueue", JSON.stringify(jobData));

      const length = await client.lLen("jobQueue");
      console.log("Queue length now:", length);

      res.json({ jobId, queueLength: length });
    } catch (error) {
      console.error("Error pushing job:", error);
      res.status(500).json({ error: "Failed to enqueue job" });
    }
  });

  app.get("/status/:id", async (req, res) => {
    try {
      const jobId = req.params.id;
      const jobs = await client.lRange("jobQueue", 0, -1);

      const job = jobs
        .map((job) => {
          try {
            return JSON.parse(job);
          } catch {
            return null;
          }
        })
        .filter((job) => job && job.id === jobId);

      if (job.length === 0) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json({ job: job[0] });
    } catch (error) {
      console.error(" Error fetching job status:", error);
      res.status(500).json({ error: "Failed to fetch job status" });
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();

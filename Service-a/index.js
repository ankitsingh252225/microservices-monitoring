// index.js
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { client, connectRedis } from "./redisClinet.js";

const app = express();
app.use(express.json());
const PORT = 3100;

async function startServer() {
  await connectRedis();

  
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
         submittedAt: new Date().toISOString()
      };

      console.log(jobData.id)

     await client.rPush("jobQueue", JSON.stringify(jobData)); // for Service B
await client.rPush("submittedJobs", jobId);              // for Service C
await client.set(`jobStatus:${jobId}`, "pending"); 

      const length = await client.lLen("jobQueue");
      console.log("Queue length now:", length)
      res.status(201).json({
        message: "Job submitted",
        jobId,
        taskType: jobData.payload.taskType,
        queueLength: length,
        status: "pending"
      });
    } catch (error) {
      console.error("Error pushing job:", error);
      res.status(500).json({ error: "Failed to enqueue job" });
    }
  });

  // app.get("/status/:id", async (req, res) => {
  //   try {
  //     const jobId = req.params.id;
  //     const jobs = await client.lRange("jobQueue", 0, -1);

  //     console.log(jobs, "all job queue")

  //     const job = jobs
  //       .map((job) => {
  //         try {
  //           return JSON.parse(job);
  //         } catch {
  //           return null;
  //         }
  //       })
  //       .filter((job) => job && job.id === jobId);

  //     if (job.length === 0) {
  //       return res.status(404).json({ message: "Job not found" });
  //     }

  //     res.json({ job: job[0] });
  //   } catch (error) {
  //     console.error(" Error fetching job status:", error);
  //     res.status(500).json({ error: "Failed to fetch job status" });
  //   }
  // });



  app.get("/status/:id", async (req, res) => {
  try {
    const jobId = req.params.id;

    const status = await client.get(`jobStatus:${jobId}`);
    const result = await client.get(`jobResult:${jobId}`);

    if (!status) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({
      jobId,
      status,
      result: result || "result not done"
    });
  } catch (error) {
    console.error("Error fetching job status:", error);
    res.status(500).json({ error: "Failed to fetch job status" });
  }
});


 app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
}

startServer();


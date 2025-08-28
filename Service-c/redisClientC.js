import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

export const client = createClient({ 
  url: redisUrl,
  socket: {
    family: 4 // force IPv4
  }
});

export async function connectRedis() {
  console.log("urlEnv", redisUrl)
  client.on("error", (err) => console.error("❌ Redis error in Service-C:", err));
  await client.connect();
  console.log(`✅ Connected to Redis at ${redisUrl}`);
}


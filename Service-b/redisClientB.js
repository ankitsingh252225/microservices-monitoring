import { createClient } from "redis";

const client = createClient({
  url: "redis://localhost:6379",
});

client.on("error", (err) => console.error("Redis Client Error", err));

async function connectRedis() {
  await client.connect();
  console.log("✅ redis is connected for ServiceB");
}

connectRedis();

export default client;

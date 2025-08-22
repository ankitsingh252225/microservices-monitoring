import { createClient } from "redis";

const client = createClient({
    url:  "redis://127.0.0.1:6379"
});

client.on("error", (err) => console.error("Redis Client Error", err));
client.on("connect", () => console.log("🔗 Redis connecting..."));
client.on("ready", () => console.log("✅ Redis ready"));

async function connectRedis() {
    await client.connect();
    console.log("✅ redis is connected");

}



export  {client, connectRedis};

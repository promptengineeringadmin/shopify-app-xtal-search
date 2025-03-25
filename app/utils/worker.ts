import { Worker } from "bullmq";
import { redisConnection } from "./redis";

const worker = new Worker(
  "productQueue",
  async (job) => {
    console.log(`Processing job ${job.id}: Sending ${job.data.products.length} products`);

    const response = await fetch("https://41de-187-161-119-1.ngrok-free.app/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job.data.products),
    });

    if (!response.ok) {
      throw new Error(`Failed to send products: ${response.statusText}`);
    }

    console.log("Products sent successfully!");
  },
  { connection: redisConnection }
);

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});

console.log("Worker started, listening for jobs...");

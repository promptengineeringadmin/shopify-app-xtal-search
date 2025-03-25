import { Queue } from "bullmq";
import { redisConnection } from "./redis"; // Separate Redis config file

export const productQueue = new Queue("productQueue", { connection: redisConnection });

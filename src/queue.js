const { Queue } = require("bullmq");

// Configuration for Redis connection
const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};

// Create a new queue for video processing
const videoQueue = new Queue("video-processing", { connection });

module.exports = videoQueue;

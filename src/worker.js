const { Worker } = require("bullmq");
const FF = require("../lib/FF.js");
const DB = require("./DB.js");
const util = require("../lib/util.js");

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};

const worker = new Worker("video-processing", async (job) => {
  if (job.name === "resize") {
    const { videoId, width, height } = job.data;
    DB.update();
    const video = DB.videos.find((v) => v.videoId === videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    const originalVideoPath = `./storage/${video.videoId}/original.${video.extension}`;
    const targetVideoPath = `./storage/${video.videoId}/${width}x${height}.${video.extension}`;

    try {
      await FF.resize(originalVideoPath, targetVideoPath, width, height);

      DB.update();
      const currentVideo = DB.videos.find((v) => v.videoId === videoId);
      if (currentVideo && currentVideo.resizes[`${width}x${height}`]) {
        currentVideo.resizes[`${width}x${height}`].processing = false;
        DB.save();
      }
      console.log(`Successfully resized ${videoId} to ${width}x${height}`);
    } catch (e) {
      console.error(e);
      util.deleteFile(targetVideoPath);
      
      DB.update();
      const currentVideo = DB.videos.find((v) => v.videoId === videoId);
      if (currentVideo && currentVideo.resizes[`${width}x${height}`]) {
        delete currentVideo.resizes[`${width}x${height}`];
        DB.save();
      }
      throw e;
    }
  }
}, { connection });

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});

console.log("Worker started...");

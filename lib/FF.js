const ffmpeg = require("fluent-ffmpeg");

const makeThumbnail = (fullPath, thumbnailPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(fullPath)
      .seekInput(5)
      .frames(1)
      .output(thumbnailPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
};

const getDimensions = (fullPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(fullPath, (err, metadata) => {
      if (err) return reject(err);
      const stream = metadata.streams.find((s) => s.codec_type === "video");
      if (!stream) return reject(new Error("No video stream found"));
      resolve({
        width: stream.width,
        height: stream.height,
      });
    });
  });
};

const extractAudio = (originalVideoPath, targetAudioPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(originalVideoPath)
      .noVideo()
      .audioCodec("aac")
      .output(targetAudioPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
};

const resize = (originalVideoPath, targetVideoPath, width, height) => {
  return new Promise((resolve, reject) => {
    ffmpeg(originalVideoPath)
      .videoFilters(`scale=${width}:${height}`)
      .audioCodec("copy")
      .output(targetVideoPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
};

module.exports = { makeThumbnail, getDimensions, extractAudio, resize };

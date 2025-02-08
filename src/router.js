// Controllers
const Video = require("./controllers/video");

module.exports = (server) => {
  // ------------------------------------------------ //
  // ************ VIDEO ROUTES ************* //
  // ------------------------------------------------ //

  // Return the list of all the videos that a logged in user has uploaded
  server.route("get", "/api/videos", Video.getVideos);

  // Upload a video file
  server.route("post", "/api/upload-video", Video.uploadVideo);

  // Extract the audio for a video file (can only be done once per video)
  server.route("patch", "/api/video/extract-audio", Video.extractAudio);

  // Resize a video file (creates a new video file)
  server.route("put", "/api/video/resize", Video.resizeVideo);

  // Return a video asset to the client
  server.route("get", "/get-video-asset", Video.getVideoAsset);
};

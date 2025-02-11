# The Video Studio

A powerful, robust video processing web application that allows users to upload, resize, and extract audio from video sequences seamlessly.

Built with a specialized queue-based Node.js backend using **BullMQ** and **Redis** for efficient asynchronous video processing, and an elegant, editorial-styled **React** frontend leveraging **Tailwind CSS v4** and **shadcn/ui**.

## Features

- **Video Uploads**: Secure and reliable uploading of large `.mp4` and `.mov` files with automatic thumbnail generation.
- **Asynchronous Resizing**: Scale videos to arbitrary dimensions. Handled efficiently via Redis queues to prevent server blocking.
- **Audio Extraction**: Reliably extract AAC audio tracks from video files. Includes robust edge-case handling for videos missing audio streams.
- **Classic Editorial UI**: A gorgeous, timeless frontend design built precisely using shadcn UI components, sharp edges, and elegant typography.
- **No Authentication Friction**: Drops right into the workspace experience instantly.
- **Dockerized Architecture**: Fully containerized using a multi-stage Docker setup, decoupling the Node backend, the Redis broker, the asynchronous worker, and the Nginx-served frontend.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, shadcn/ui, Lucide Icons
- **Backend**: Node.js (cpeak router framework)
- **Processing Engine**: FFmpeg / FFprobe (via fluent-ffmpeg)
- **Queue/Broker**: BullMQ / Redis
- **Containerization**: Docker & Docker Compose (Nginx for static serving)

## Edge Cases Resolved

- **Missing Audio Tracks**: FFmpeg correctly catches and prevents crashes when attempting to extract audio from silent videos, explicitly notifying the client.
- **Resilient Audio Encoding**: Forces AAC codec transcodings rather than raw copying to ensure container compliance.
- **Null Safety on Assets**: Accessing invalid, missing, or unsupported `type` assets correctly falls back to robust 404/400 errors instead of causing unhandled Promise rejections and hanging the server.
- **Worker Synchronization**: Video records seamlessly integrate between the API thread and the detached `worker.js` thread securely utilizing the `database.json`.

## Architecture & Scaling Roadmap

The current application utilizes a **Decoupled, Asynchronous Client-Server Architecture** featuring a **Message Queue / Background Worker Pattern**. Because the API server is separated from the FFmpeg background worker using a Redis queue, the foundation is already primed for immense scale. 

However, to handle enterprise-level traffic and vast storage requirements, the following architectural bottlenecks must be resolved in future iterations:

### 1. Externalize Storage to the Cloud (I/O Bound)
- **The Bottleneck:** Currently, video blobs are stored on the local file system (`./storage/`). If multiple API or Worker containers are spun up, they won't share the same disk structure.
- **The Solution:** Migrate file storage to Cloud Object Storage (e.g., AWS S3, Google Cloud Storage, Cloudflare R2). 
- **Bonus:** This enables **Presigned URLs**, allowing the React frontend to upload gigabytes of video directly to S3, bypassing the Node.js API entirely and saving massive bandwidth.

### 2. Replace the JSON Data Store
- **The Bottleneck:** The application currently utilizes an in-memory JSON file (`data/database.json`) acting as a rudimentary store. It locks synchronously and prevents horizontal scaling.
- **The Solution:** Migrate to a true relational or NoSQL database (e.g., PostgreSQL, MongoDB) built to gracefully handle concurrent reads/writes and enforce data integrity.

### 3. Horizontally Scale the Background Workers (CPU Bound)
- **The Bottleneck:** Video rendering with FFmpeg is highly CPU-intensive. A single worker will eventually choke under high load.
- **The Solution:** With BullMQ/Redis acting as a traffic cop, you can infinitely scale isolated `worker` containers horizontally across multiple virtual machines or Kubernetes clusters based on traffic spikes.

### 4. Horizontally Scale the Stateless API (Traffic Bound)
- **The Bottleneck:** A single API container routing all incoming HTTP traffic.
- **The Solution:** Once the database and storage are externalized, the API becomes entirely "Stateless." You can run dozens of duplicate `api` containers sitting behind a Load Balancer to field thousands of requests per second smoothly.

### 5. Upgrade Real-Time Communications
- **The Bottleneck:** The React app uses "short polling" (pinging the backend every 5 seconds) to track video processing progress.
- **The Solution:** Implement WebSockets (e.g., Socket.io) or Server-Sent Events (SSE). The server will remain completely silent until the exact millisecond a worker finishes a job, pushing a notification to the frontend and eliminating wasted HTTP requests.

## Quick Start (Docker - Recommended)

The easiest way to get the application running is via Docker Compose:

```bash
# Spin up the entire infrastructure (Redis, API, Worker, Nginx Frontend)
docker-compose up --build
```

The application will now be available locally on **http://localhost:5139**.

## Manual Setup

If you prefer to run it natively without Docker:

### Prerequisites
- Node.js (v20+)
- FFmpeg and FFprobe installed and accessible in your system `PATH`
- A running Redis server on `localhost:6379`

### 1. Start the API Server
```bash
npm install
npm run start
```
*Runs on port 8060.*

### 2. Start the Background Worker
```bash
# In a new terminal window
node src/worker.js
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*Vite will proxy API requests automatically.*

---
*© The Video Studio. All Rights Reserved.*

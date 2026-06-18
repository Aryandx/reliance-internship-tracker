require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => socket.join(userId));
});

app.set('io', io);

// Start server first so Render health check passes, then connect DB
server.listen(PORT, () => {
  console.log(`\n  Internship Tracker API`);
  console.log(`  Server  → http://localhost:${PORT}`);
  console.log(`  Health  → http://localhost:${PORT}/api/v1/health\n`);
});

connectDB().then(async () => {
  await require('./src/seed')();  // create test accounts if they don't exist
  require('./src/jobs/cron');     // start scheduled jobs after DB ready
}).catch(() => {});

// Self-ping every 10 minutes to prevent Render free-tier sleep
const SELF_URL = process.env.RENDER_EXTERNAL_URL
  ? `${process.env.RENDER_EXTERNAL_URL}/api/v1/health`
  : null;

if (SELF_URL) {
  setInterval(() => {
    http.get(SELF_URL, (res) => {
      console.log(`[keep-alive] ping → ${res.statusCode}`);
    }).on('error', (err) => {
      console.warn(`[keep-alive] ping failed: ${err.message}`);
    });
  }, 10 * 60 * 1000);
  console.log(`  Keep-alive ping active (every 10 min)\n`);
}

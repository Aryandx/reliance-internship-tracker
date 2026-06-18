require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', credentials: true }
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => socket.join(userId));
});

app.set('io', io);

connectDB().then(() => {
  require('./src/jobs/cron'); // start scheduled jobs
  server.listen(PORT, () => {
    console.log(`\n  Internship Tracker API`);
    console.log(`  Server  → http://localhost:${PORT}`);
    console.log(`  Health  → http://localhost:${PORT}/api/v1/health\n`);
  });
});

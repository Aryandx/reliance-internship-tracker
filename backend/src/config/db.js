const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('FATAL: MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const tryConnect = async (attempt = 1) => {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB connected: ${conn.connection.host} → ${conn.connection.name}`);
    } catch (err) {
      console.error(`MongoDB attempt ${attempt} failed: ${err.message}`);
      const delay = Math.min(attempt * 3000, 30000);
      console.log(`Retrying in ${delay / 1000}s...`);
      setTimeout(() => tryConnect(attempt + 1), delay);
    }
  };

  await tryConnect();
};

module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 10;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB connected: ${conn.connection.host} → ${conn.connection.name}`);
      return;
    } catch (err) {
      console.error(`MongoDB attempt ${i}/${maxRetries} failed: ${err.message}`);
      if (i === maxRetries) { process.exit(1); }
      await new Promise(r => setTimeout(r, 3000));
    }
  }
};

module.exports = connectDB;

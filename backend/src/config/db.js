const mongoose = require("mongoose");
const dns = require("dns");

// Set reliable public DNS servers to resolve MongoDB SRV records
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore if custom DNS fails to set
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    console.error(
      "👉 Please make sure 0.0.0.0/0 is added in MongoDB Atlas -> Network Access."
    );
    process.exit(1);
  }
};

module.exports = connectDB;
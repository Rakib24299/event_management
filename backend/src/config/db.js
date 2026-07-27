const mongoose = require("mongoose");

const dns=require("dns");
dns.setServers(["8.8.8.8"])

const connectDB = async () => {
  try
   {
    await mongoose.connect(process.env.DATABASE_URL);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
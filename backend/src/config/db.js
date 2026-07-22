const mongoose = require("mongoose");
require("dotenv").config();

const dns=require("dns");
dns.setServers(["8.8.8.8"])

const connectDB = async () => {
  try {
    

    await mongoose.connect(process.env.DATABASE_URL);

    console.log("✅ Database Connected Successfully");
  }
  catch (error)
   {
    console.error("❌ Database Connection Failed");
    console.error(error);
    process.exit(1);
}
};

module.exports = connectDB;
require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const createDefaultAdmin = require("./src/seed/admin.seed");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create Default Admin
    await createDefaultAdmin();

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
const bcrypt = require("bcryptjs");

const User = require("../models/User");


// Create Default Admin***
const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log("✅ Default admin already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      10
    );

    await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      phone: process.env.ADMIN_PHONE,
      role: "admin",
      address: "System",

      approvalStatus: "approved",
      status: "active",
      isVerified: true,
    });

    console.log("✅ Default admin created successfully.");
  } catch (error) {
    console.error("❌ Admin Seeder Error:", error.message);
  }
};

module.exports = createDefaultAdmin;
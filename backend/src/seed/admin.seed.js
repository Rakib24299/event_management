const bcrypt = require("bcryptjs");

const User = require("../models/User");


// Create or Sync Default Admin
const createDefaultAdmin = async () => {
  try {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return;
    }

    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    }).select("+password");

    if (existingAdmin) {
      let isMatch = false;
      if (existingAdmin.password) {
        isMatch = await bcrypt.compare(
          process.env.ADMIN_PASSWORD,
          existingAdmin.password
        );
      }

      if (!isMatch) {
        const hashedPassword = await bcrypt.hash(
          process.env.ADMIN_PASSWORD,
          10
        );
        existingAdmin.password = hashedPassword;
        if (process.env.ADMIN_NAME) existingAdmin.name = process.env.ADMIN_NAME;
        if (process.env.ADMIN_PHONE) existingAdmin.phone = process.env.ADMIN_PHONE;
        existingAdmin.approvalStatus = "approved";
        existingAdmin.status = "active";
        existingAdmin.isVerified = true;
        await existingAdmin.save();
        console.log("🔄 Admin password synced from .env successfully.");
      } else {
        console.log("✅ Default admin exists and is up to date.");
      }
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      10
    );

    await User.create({
      name: process.env.ADMIN_NAME || "Admin",
      email: process.env.ADMIN_EMAIL,
      // password: hashedPassword,
      password: process.env.ADMIN_PASSWORD,
      phone: process.env.ADMIN_PHONE || "",
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
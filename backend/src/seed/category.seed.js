const Category = require("../models/Category");

const DEFAULT_CATEGORIES = [
  "Music",
  "Sports",
  "Technology",
  "Business",
  "Food & Drink",
  "Arts & Culture",
  "Health & Wellness",
  "Education",
  "Travel & Outdoor",
  "Entertainment",
];

// Create Default Categories***
const createDefaultCategories = async () => {
  try {
    for (const name of DEFAULT_CATEGORIES) {
      const slug = name
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const existing = await Category.findOne({
        slug,
        isDeleted: false,
      });

      if (existing) {
        continue;
      }

      await Category.create({
        name,
        slug,
        description: `${name} events`,
        status: "active",
        isDeleted: false,
      });
    }

    console.log("✅ Default categories created successfully.");
  } catch (error) {
    console.error("❌ Category Seeder Error:", error.message);
  }
};

module.exports = createDefaultCategories;

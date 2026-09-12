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

      // name অথবা slug যেকোনো একটি পাওয়া গেলেই ডুপ্লিকেট তৈরি করবে না
          const existing = await Category.findOne({
            $or: [{ name }, { slug }]
          });

          if (existing) {
            continue; // ইতিমধ্যে থাকলে স্কিপ করবে
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

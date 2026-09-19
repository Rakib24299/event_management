const Category = require("../models/Category");
const Event = require("../models/Event");
const AppError = require("../utils/AppError");

// Generate Slug

const generateSlug = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// Create Category

const createCategory = async (payload) => {
  const name = payload.name.trim();

  if (!name) {
    throw new AppError("Category name is required.", 400);
  }

  const slug = generateSlug(name);

  // Check duplicate category name
  const existingCategory = await Category.findOne({
    name: {
      $regex: `^${name}$`,
      $options: "i",
    },
    isDeleted: false,
  });

  if (existingCategory) {
    throw new AppError("Category already exists.", 409);
  }

  // Check duplicate slug
  const existingSlug = await Category.findOne({
    slug,
    isDeleted: false,
  });

  if (existingSlug) {
    throw new AppError("Category slug already exists.", 409);
  }

  const category = await Category.create({
    name,
    slug,
  });

  return category;
};

// Get All Categories
// Only Active Categories

const getAllCategories = async () => {
  const categories = await Category.find({
    isDeleted: { $ne: true },
  }).sort({
    createdAt: -1,
  });

  return categories;
};

// Get Single Category

const getSingleCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category || category.isDeleted) {
    throw new AppError("Category not found.", 404);
  }

  return category;
};

// Update Category

const updateCategory = async (categoryId, payload) => {
  const category = await Category.findById(categoryId);

  if (!category || category.isDeleted) {
    throw new AppError("Category not found.", 404);
  }

  const name = payload.name.trim();

  if (!name) {
    throw new AppError("Category name is required.", 400);
  }

  const slug = generateSlug(name);

  // Check duplicate category name
  const duplicateCategory = await Category.findOne({
    _id: {
      $ne: categoryId,
    },

    name: {
      $regex: `^${name}$`,
      $options: "i",
    },

    isDeleted: false,
  });

  if (duplicateCategory) {
    throw new AppError("Category already exists.", 409);
  }

  // Check duplicate slug
  const duplicateSlug = await Category.findOne({
    _id: {
      $ne: categoryId,
    },

    slug,

    isDeleted: false,
  });

  if (duplicateSlug) {
    throw new AppError("Category slug already exists.", 409);
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    {
      name,
      slug,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return updatedCategory;
};

// Delete Category
// Soft Delete

const deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category || category.isDeleted) {
    throw new AppError("Category not found.", 404);
  }

  // Check whether this category is already
  // assigned to any active event
  const eventCount = await Event.countDocuments({
    category: categoryId,
    isDeleted: false,
  });

  if (eventCount > 0) {
    throw new AppError(
      "Cannot delete category because it is assigned to existing events.",
      400
    );
  }

  category.isDeleted = true;
  category.deletedAt = new Date();

  await category.save();

  return {
    message: "Category deleted successfully.",
  };
};

// Export

module.exports = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
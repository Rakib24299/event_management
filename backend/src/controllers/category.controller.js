const categoryService = require("../services/category.service");
const catchAsync = require("../utils/catchAsync");

// ========================================
// Create Category
// ========================================

const createCategory = catchAsync(async (req, res) => {
  const result = await categoryService.createCategory(req.body);

  return res.status(201).json({
    success: true,
    message: "Category created successfully.",
    data: result,
  });
});

// ========================================
// Get All Categories
// ========================================

const getAllCategories = catchAsync(async (req, res) => {
  const result = await categoryService.getAllCategories();

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// ========================================
// Get Single Category
// ========================================

const getSingleCategory = catchAsync(async (req, res) => {
  const result = await categoryService.getSingleCategory(req.params.id);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// ========================================
// Update Category
// ========================================

const updateCategory = catchAsync(async (req, res) => {
  const result = await categoryService.updateCategory(
    req.params.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Category updated successfully.",
    data: result,
  });
});

// ========================================
// Delete Category
// ========================================

const deleteCategory = catchAsync(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

// ========================================
// Export
// ========================================

module.exports = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
const express = require("express");

const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validateRequest = require("../middlewares/validateRequest");

const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validations/category.validation");

const router = express.Router();

// Create Category
// Admin Only

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  validateRequest(createCategorySchema),
  categoryController.createCategory
);

// Get All Categories
// Public
// Organizer will use this API

router.get(
  "/",
  categoryController.getAllCategories
);

// Get Single Category

router.get(
  "/:id",
  categoryController.getSingleCategory
);

// Update Category
// Admin Only

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateRequest(updateCategorySchema),
  categoryController.updateCategory
);

// Delete Category
// Admin Only

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  categoryController.deleteCategory
);

module.exports = router;
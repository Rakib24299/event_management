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


// Create Category****


router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  validateRequest(createCategorySchema),
  categoryController.createCategory
);


// Get All Categories***


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


router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateRequest(updateCategorySchema),
  categoryController.updateCategory
);


// Delete Category


router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  categoryController.deleteCategory
);

module.exports = router;
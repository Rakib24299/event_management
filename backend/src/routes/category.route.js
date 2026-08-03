const express = require("express");

const categoryController = require("../controllers/category.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");
const roleMiddleware = require("../middlewares/role.middleware");


const {createCategorySchema,updateCategorySchema,} = require("../validations/category.validation");

const router = express.Router();



// Create Category

authMiddleware,
roleMiddleware("admin"),



// Get All Categories

router.get("/",categoryController.getAllCategories);


// Get Single Category
router.get("/:id",categoryController.getSingleCategory);

// Update Category

authMiddleware,
roleMiddleware("admin"),

// Delete Category

authMiddleware,
roleMiddleware("admin"),




module.exports = router;
const categoryService = require("../services/category.service")


// Create Category

const createCategory = async (req, res) => {
  try {
    const result = await categoryService.createCategory(req.body);

    return res.status(201).json(
    {
        success: true,
        message: "Category created successfully.",
        data: result,
    });
  }

   catch (error) 
   
   {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};

// Get All Categories

const getAllCategories = async (req, res) => {
  try {
    const result = await categoryService.getAllCategories();

    return res.status(200).json(
    {
      success: true,
      data: result,
    });
  } 
  catch (error) 
  {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};

// Get Single Category

const getSingleCategory = async (req, res) => {
  try {
    const result = await categoryService.getSingleCategory(req.params.id);

    return res.status(200).json(
    {
      success: true,
      data: result,
    });
  }
   catch (error)
    {
    return res.status(404).json(
    {
      success: false,
      message: error.message,
    });
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const result = await categoryService.updateCategory(
        req.params.id,
        req.body
    );

    return res.status(200).json(
    {
      success: true,
      message: "Category updated successfully.",
      data: result,
    });
  } 
  catch (error) 
  {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);

    return res.status(200).json(
    {
      success: true,
      message: result.message,
    });
  }
  catch (error) 
  {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
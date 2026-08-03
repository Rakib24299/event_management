const Category = require("../models/Category");


// ***Create Category***

const createCategory = async (payload) => {
  const existingCategory = await Category.findOne(
    {
        name: payload.name,
    });

  if (existingCategory) 
    {
        throw new Error("Category already exists.");
    }

  const category = await Category.create(payload);

  return category;
};

// ****Get All Categories****

const getAllCategories = async () => {
  const categories = await Category
    .find({ isDeleted: false, })
    .sort({ createdAt: -1 });

  return categories;
};

// ****Get Single Category****

const getSingleCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category || category.isDeleted)
     {
        throw new Error("Category not found.");
     }

  return category;
};

// ****Update Category****

const updateCategory = async (categoryId, payload) => {
  const category = await Category.findById(categoryId);

  if (!category || category.isDeleted) 
    {
     throw new Error("Category not found.");
    }

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    payload,
    {
      new: true,
      runValidators: true,
    }
  );

  return updatedCategory;
};


// Delete Category (Soft Delete)


const deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category || category.isDeleted)
    {
      throw new Error("Category not found.");
    }

  category.isDeleted = true;
  category.deletedAt = new Date();

  await category.save();

  return {message: "Category deleted successfully.",};
};


module.exports = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
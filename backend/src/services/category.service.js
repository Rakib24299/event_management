const Category = require("../models/Category");
const AppError = require("../utils/AppError");
const Event = require("../models/Event");


// ***Create Category***

const createCategory = async (payload) => {
  const existingCategory = await Category.findOne({
    name: payload.name,
    isDeleted: false,
  });

  if (existingCategory) {
    throw new AppError("Category already exists.",409);
  }

  const category = await Category.create(payload);

  return category;

  
};


// ****Get All Categories****

const getAllCategories = async () => {
  const categories = await Category.find(
  {
    isDeleted: false,
  }).sort({
    createdAt: -1,
  });

  return categories;
};



// ****Get Single Category****


const getSingleCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category || category.isDeleted) 
    {
    throw new AppError("Category not found.",404 );
  }

  return category;
};

// ****Update Category****

const updateCategory = async (categoryId,payload) => {
  const category = await Category.findById(categoryId);

  if (!category || category.isDeleted) 
    {
    throw new AppError("Category not found.",404);
  }

  const duplicateCategory = await Category.findOne({
    _id: { $ne: categoryId },
    name: payload.name,
    isDeleted: false,
  });

  if (duplicateCategory)
    {
    throw new AppError("Category already exists.",409);
    }

  const updatedCategory =
    await Category.findByIdAndUpdate(categoryId,payload,
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
    throw new AppError("Category not found.",404);
  }

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

  return { message: "Category deleted successfully.",};
};


module.exports = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
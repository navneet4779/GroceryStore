import SubCategoryModel from "../models/subCategoryModel.js";
import CategoryModel from "../models/categoryModel.js";

export const getSubCategoryController = async (request, response) => {
    console.log("getSubCategoryController called");
    try {
        // Fetch all subcategories and include the associated category
        const data = await SubCategoryModel.findAll({
            include: [
                {
                    model: CategoryModel,
                    as: "category", // Ensure this matches the alias in your Sequelize association
                },
            ],
            order: [["createdAt", "DESC"]], // Sort by `createdAt` in descending order
        });

        return response.json({
            message: "Sub Category data",
            data: data,
            error: false,
            success: true,
        });
    } catch (error) {
        console.error("Error in getSubCategoryController:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
};

export const AddSubCategoryController = async (request, response) => {
    try {
        const { name, image, category } = request.body;

        // Validate required fields
        if (!name || !image || !category || category.length === 0) {
            return response.status(400).json({
                message: "Provide name, image, and at least one category",
                error: true,
                success: false,
            });
        }

        // Extract the first category (assuming only one category is allowed)
        const categoryId = category[0]; // Use category[0] if it's an array

        const payload = {
            name,
            image,
            categoryId, // Save the category ID
        };

        // Create and save the subcategory
        const createSubCategory = await SubCategoryModel.create(payload);

        console.log("AddSubCategoryController called with data:", createSubCategory);

        return response.json({
            message: "Sub Category Created",
            data: createSubCategory,
            error: false,
            success: true,
        });
    } catch (error) {
        console.error("Error in AddSubCategoryController:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
};
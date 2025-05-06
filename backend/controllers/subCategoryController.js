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
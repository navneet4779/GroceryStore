import CategoryModel from "../models/categoryModel.js";

export const getCategoryController = async (request, response) => {
    try {
        // Fetch all categories and sort by `createdAt` in descending order
        const data = await CategoryModel.findAll({
            order: [["createdAt", "DESC"]], // Sort by `createdAt` in descending order
        });

        return response.json({
            data: data,
            error: false,
            success: true,
        });
    } catch (error) {
        console.error("Error in getCategoryController:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
};
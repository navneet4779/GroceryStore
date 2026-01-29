import SubCategoryModel from "../models/subCategoryModel.js";
import CategoryModel from "../models/categoryModel.js";
import ProductModel from "../models/productModel.js";
import { sequelize } from "../config/connectDB.js";

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

export const updateSubCategoryController = async (request, response) => {
    try {
        const subCategoryId = request.body.id || request.body._id;
        const { name, image, category, categoryId } = request.body;

        const selectedCategoryId = categoryId || (Array.isArray(category) ? category[0] : category);

        if (!subCategoryId) {
            return response.status(400).json({
                message: "Subcategory id is required",
                error: true,
                success: false,
            });
        }

        if (!name || !image || !selectedCategoryId) {
            return response.status(400).json({
                message: "Provide name, image, and category",
                error: true,
                success: false,
            });
        }

        const [updatedCount] = await SubCategoryModel.update(
            {
                name,
                image,
                categoryId: selectedCategoryId,
            },
            { where: { id: subCategoryId } }
        );

        if (updatedCount === 0) {
            return response.status(404).json({
                message: "Subcategory not found",
                error: true,
                success: false,
            });
        }

        const updatedSubCategory = await SubCategoryModel.findByPk(subCategoryId, {
            include: [
                {
                    model: CategoryModel,
                    as: "category",
                },
            ],
        });

        return response.json({
            message: "Subcategory updated successfully",
            data: updatedSubCategory,
            success: true,
            error: false,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

export const deleteSubCategoryController = async (request, response) => {
    try {
        const subCategoryId = request.body.id || request.body._id;

        if (!subCategoryId) {
            return response.status(400).json({
                message: "Subcategory id is required",
                error: true,
                success: false,
            });
        }

        const transaction = await sequelize.transaction();
        try {
            await ProductModel.destroy({
                where: { subCategoryId: subCategoryId },
                transaction
            });
            const deletedCount = await SubCategoryModel.destroy({
                where: { id: subCategoryId },
                transaction
            });

            if (!deletedCount) {
                await transaction.rollback();
                return response.status(404).json({
                    message: "Subcategory not found",
                    error: true,
                    success: false,
                });
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        return response.json({
            message: "Subcategory deleted successfully",
            success: true,
            error: false,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};
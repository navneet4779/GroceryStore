import CategoryModel from "../models/categoryModel.js";
import SubCategoryModel from "../models/subCategoryModel.js";
import ProductModel from "../models/productModel.js";
import { sequelize } from "../config/connectDB.js";

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

export const AddCategoryController = async(request,response)=>{
    try {
        const { name , image } = request.body 

        if(!name || !image){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const addCategory = new CategoryModel({
            name,
            image
        })

        const saveCategory = await addCategory.save()

        if(!saveCategory){
            return response.status(500).json({
                message : "Not Created",
                error : true,
                success : false
            })
        }

        return response.json({
            message : "Add Category",
            data : saveCategory,
            success : true,
            error : false
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const updateCategoryController = async (request, response) => {
    try {
        const categoryId = request.body.id || request.body._id;
        const { name, image } = request.body;

        if (!categoryId) {
            return response.status(400).json({
                message: "Category id is required",
                error: true,
                success: false,
            });
        }

        if (!name || !image) {
            return response.status(400).json({
                message: "Provide name and image",
                error: true,
                success: false,
            });
        }

        const [updatedCount] = await CategoryModel.update(
            { name, image },
            { where: { id: categoryId } }
        );

        if (updatedCount === 0) {
            return response.status(404).json({
                message: "Category not found",
                error: true,
                success: false,
            });
        }

        const updatedCategory = await CategoryModel.findByPk(categoryId);

        return response.json({
            message: "Category updated successfully",
            data: updatedCategory,
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

export const deleteCategoryController = async (request, response) => {
    try {
        const categoryId = request.body.id || request.body._id;

        if (!categoryId) {
            return response.status(400).json({
                message: "Category id is required",
                error: true,
                success: false,
            });
        }

        const transaction = await sequelize.transaction();
        try {
            await ProductModel.destroy({
                where: { categoryId: categoryId },
                transaction
            });
            await SubCategoryModel.destroy({
                where: { categoryId: categoryId },
                transaction
            });
            const deletedCount = await CategoryModel.destroy({
                where: { id: categoryId },
                transaction
            });

            if (!deletedCount) {
                await transaction.rollback();
                return response.status(404).json({
                    message: "Category not found",
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
            message: "Category deleted successfully",
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
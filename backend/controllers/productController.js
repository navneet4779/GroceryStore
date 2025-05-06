import { Op } from "sequelize";
import ProductModel from "../models/productModel.js"; // Ensure this is your Sequelize model
import CategoryModel from "../models/categoryModel.js"; // Ensure this is your Sequelize model
import SubCategoryModel from "../models/subCategoryModel.js"; // Ensure this is your Sequelize model

export const searchProduct = async (request, response) => {
    try {
        let { search, page, limit } = request.body;

        // Set default values for page and limit
        page = page || 1;
        limit = limit || 10;

        // Build the search query
        const query = search
            ? {
                  [Op.or]: [
                      { name: { [Op.like]: `%${search}%` } }, // Search by product name
                      { description: { [Op.like]: `%${search}%` } }, // Search by product description
                  ],
              }
            : {};

        // Calculate the offset for pagination
        const offset = (page - 1) * limit;

        // Fetch data and count in parallel
        const [data, dataCount] = await Promise.all([
            ProductModel.findAll({
                where: query,
                include: [
                    { model: CategoryModel, as: "category" }, // Include category
                    { model: SubCategoryModel, as: "subCategory" }, // Include subCategory
                ],
                order: [["createdAt", "DESC"]], // Sort by createdAt in descending order
                limit: parseInt(limit),
                offset: parseInt(offset),
            }),
            ProductModel.count({ where: query }),
        ]);

        // Return the response
        return response.json({
            message: "Product data",
            error: false,
            success: true,
            data: data,
            totalCount: dataCount,
            totalPage: Math.ceil(dataCount / limit),
            page: page,
            limit: limit,
        });
    } catch (error) {
        console.error("Error in searchProduct:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
};


export const getProductDetails = async (request, response) => {
    try {
        const { productId } = request.body;

        // Fetch the product details using Sequelize
        const product = await ProductModel.findOne({
            where: { id: productId }, // Use `id` instead of `_id` for MySQL
            include: [
                { model: CategoryModel, as: "category" }, // Include category details
                { model: SubCategoryModel, as: "subCategory" }, // Include sub-category details
            ],
        });

        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false,
            });
        }

        return response.json({
            message: "Product details",
            data: product,
            error: false,
            success: true,
        });
    } catch (error) {
        console.error("Error in getProductDetails:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
};


export const getProductByCategory = async(request,response)=>{
    try {
        const { id } = request.body 

        if(!id){
            return response.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        // Fetch products by category ID using Sequelize
        const products = await ProductModel.findAll({
            where: { categoryId: id }, // Match the category ID
            include: [
                { model: CategoryModel, as: "category" }, // Include category details
                { model: SubCategoryModel, as: "subCategory" }, // Include sub-category details
            ],
            limit: 15, // Limit the results to 15
            order: [["createdAt", "DESC"]], // Sort by `createdAt` in descending order
        });

        return response.json({
            message: "Category product list",
            data: products,
            error: false,
            success: true,
        });
    } catch (error) {
        console.error("Error in getProductByCategory:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
};
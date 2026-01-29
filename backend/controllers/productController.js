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

export const getProductByCategoryAndSubCategory = async (request, response) => {
    try {
        let { categoryId, subCategoryId, page, limit } = request.body;

        // Validate required fields
        if (!categoryId || !subCategoryId) {
            return response.status(400).json({
                message: "Provide categoryId and subCategoryId",
                error: true,
                success: false,
            });
        }

        // Set default values for pagination
        page = page || 1;
        limit = limit || 10;

        // Calculate the offset for pagination
        const offset = (page - 1) * limit;

        // Fetch products by category and sub-category using Sequelize
        const [data, dataCount] = await Promise.all([
            ProductModel.findAll({
                where: {
                    categoryId: categoryId, // Match categoryId
                    subCategoryId: subCategoryId, // Match subCategoryId
                },
                include: [
                    { model: CategoryModel, as: "category" }, // Include category details
                    { model: SubCategoryModel, as: "subCategory" }, // Include sub-category details
                ],
                order: [["createdAt", "DESC"]], // Sort by createdAt in descending order
                limit: parseInt(limit), // Limit the number of results
                offset: parseInt(offset), // Skip results for pagination
                logging: console.log, // Log the SQL query for this operation
            }),
            ProductModel.count({
                where: {
                    categoryId: categoryId,
                    subCategoryId: subCategoryId,
                },
            }),
        ]);



        // Return the response
        return response.json({
            message: "Product list",
            data: data,
            totalCount: dataCount,
            totalPage: Math.ceil(dataCount / limit),
            page: page,
            limit: limit,
            success: true,
            error: false,
        });
    } catch (error) {
        console.error("Error in getProductByCategoryAndSubCategory:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
};

export const getProductController = async (request, response) => {
    try {
        let { page, limit, search } = request.body;

        // Set default values for pagination
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
        const [data, totalCount] = await Promise.all([
            ProductModel.findAll({
                where: query,
                include: [
                    { model: CategoryModel, as: "category" }, // Include category details
                    { model: SubCategoryModel, as: "subCategory" }, // Include sub-category details
                ],
                order: [["createdAt", "DESC"]], // Sort by createdAt in descending order
                limit: parseInt(limit), // Limit the number of results
                offset: parseInt(offset), // Skip results for pagination
            }),
            ProductModel.count({ where: query }),
        ]);

        // Return the response
        return response.json({
            message: "Product data",
            error: false,
            success: true,
            totalCount: totalCount,
            totalNoPage: Math.ceil(totalCount / limit),
            data: data,
        });
    } catch (error) {
        console.error("Error in getProductController:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
};

export const createProductController = async(request,response)=>{
    try {
        const { 
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
        } = request.body 

        if(!name || !image[0] || !category[0] || !subCategory[0] || !unit || !price || !description ){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const categoryId = category[0];
        const subCategoryId = subCategory[0]; // Use subCategory[0] if it's an array

        const product = new ProductModel({
            name ,
            image ,
            categoryId,
            subCategoryId,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
        })
        const saveProduct = await product.save()

        return response.json({
            message : "Product Created Successfully",
            data : saveProduct,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

const normalizeIdArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === "object" ? item.id || item._id : item))
            .filter(Boolean);
    }
    return [typeof value === "object" ? value.id || value._id : value].filter(Boolean);
};

export const updateProductController = async (request, response) => {
    try {
        const productId = request.body.id || request.body._id;

        if (!productId) {
            return response.status(400).json({
                message: "Product id is required",
                error: true,
                success: false,
            });
        }

        const {
            name,
            image,
            category,
            subCategory,
            categoryId,
            subCategoryId,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
            publish,
        } = request.body;

        const normalizedCategoryId = categoryId || normalizeIdArray(category)[0];
        const normalizedSubCategoryId = subCategoryId || normalizeIdArray(subCategory)[0];

        const updateFields = {
            ...(name !== undefined && { name }),
            ...(image !== undefined && { image }),
            ...(unit !== undefined && { unit }),
            ...(stock !== undefined && { stock }),
            ...(price !== undefined && { price }),
            ...(discount !== undefined && { discount }),
            ...(description !== undefined && { description }),
            ...(more_details !== undefined && { more_details }),
            ...(publish !== undefined && { publish }),
            ...(normalizedCategoryId !== undefined && { categoryId: normalizedCategoryId }),
            ...(normalizedSubCategoryId !== undefined && { subCategoryId: normalizedSubCategoryId }),
        };

        const [updatedCount] = await ProductModel.update(updateFields, {
            where: { id: productId },
        });

        if (updatedCount === 0) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false,
            });
        }

        const updatedProduct = await ProductModel.findByPk(productId, {
            include: [
                { model: CategoryModel, as: "category" },
                { model: SubCategoryModel, as: "subCategory" },
            ],
        });

        return response.json({
            message: "Product updated successfully",
            data: updatedProduct,
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

export const deleteProductController = async (request, response) => {
    try {
        const productId = request.body.id || request.body._id;

        if (!productId) {
            return response.status(400).json({
                message: "Product id is required",
                error: true,
                success: false,
            });
        }

        const deletedCount = await ProductModel.destroy({
            where: { id: productId },
        });

        if (!deletedCount) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false,
            });
        }

        return response.json({
            message: "Product deleted successfully",
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
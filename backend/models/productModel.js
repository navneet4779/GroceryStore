import { DataTypes } from "sequelize";
import {sequelize} from "../config/connectDB.js"; // Ensure this is your Sequelize instance
import CategoryModel from "./categoryModel.js"; // Import Category model
import SubCategoryModel from "./subCategoryModel.js"; // Import SubCategory model

const ProductModel = sequelize.define(
    "Product",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.JSON, // Use JSON to store an array of images
            defaultValue: [],
        },
        unit: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: null,
        },
        price: {
            type: DataTypes.FLOAT,
            defaultValue: null,
        },
        discount: {
            type: DataTypes.FLOAT,
            defaultValue: null,
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        more_details: {
            type: DataTypes.JSON, // Use JSON to store additional details
            defaultValue: {},
        },
        publish: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
        tableName: "products", // Specify the table name
    }
);

// Define associations
ProductModel.belongsTo(CategoryModel, { as: "category", foreignKey: "categoryId" });
ProductModel.belongsTo(SubCategoryModel, { as: "subCategory", foreignKey: "subCategoryId" });

export default ProductModel;
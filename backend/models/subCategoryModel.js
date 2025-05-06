import { DataTypes } from "sequelize";
import {sequelize} from "../config/connectDB.js"; // Ensure this is your Sequelize instance
import CategoryModel from "./categoryModel.js"; // Import the Category model

const SubCategoryModel = sequelize.define(
    "SubCategory",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        image: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: CategoryModel, // Reference the Category model
                key: "id",
            },
        },
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
        tableName: "subCategories", // Specify the table name
    }
);

// Define associations
SubCategoryModel.belongsTo(CategoryModel, { as: "category", foreignKey: "categoryId" });

export default SubCategoryModel;
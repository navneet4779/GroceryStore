import { DataTypes } from "sequelize";
import {sequelize} from "../config/connectDB.js"; // Ensure this is your Sequelize instance

const CategoryModel = sequelize.define(
    "Category",
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
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
        tableName: "categories", // Specify the table name
    }
);

export default CategoryModel;
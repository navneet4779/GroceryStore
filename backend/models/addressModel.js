import { DataTypes } from "sequelize";
import {sequelize} from "../config/connectDB.js"; // Your Sequelize instance

const Address = sequelize.define(
    "Address",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        address_line: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        pincode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        mobile: {
            type: DataTypes.STRING, // Changed to STRING to handle international numbers
            allowNull: true,
            defaultValue: null,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
        tableName: "addresses", // Table name in the database
    }
);

export default Address;
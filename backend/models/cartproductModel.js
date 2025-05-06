import { DataTypes } from "sequelize";
import {sequelize} from "../config/connectDB.js"; // Ensure this is your Sequelize instance
import ProductModel from "./productModel.js"; // Import the Product model
import UserModel from "./userModel.js"; // Import the User model

const CartProductModel = sequelize.define(
    "CartProduct",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: ProductModel, // Reference the Product model
                key: "id",
            },
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: UserModel, // Reference the User model
                key: "id",
            },
        },
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
        tableName: "cartProducts", // Specify the table name
    }
);

// Define associations
CartProductModel.belongsTo(ProductModel, { as: "product", foreignKey: "productId" });
CartProductModel.belongsTo(UserModel, { as: "user", foreignKey: "userId" });

export default CartProductModel;
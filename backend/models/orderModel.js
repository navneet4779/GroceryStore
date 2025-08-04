import { DataTypes } from "sequelize";
import {sequelize} from "../config/connectDB.js"; // Your Sequelize instance
import UserModel from "./userModel.js"; // Import the User model
import ProductModel from "./productModel.js"; // Import the Product model
import AddressModel from "./addressModel.js";

const OrderModel = sequelize.define(
    "Order",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        orderId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_details: {
            type: DataTypes.TEXT, // Store JSON string for product details
            allowNull: false,
        },
        paymentId: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        payment_status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        delivery_address: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tookanTaskId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: "",
        },
        deliveryStatus: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "Pending",
        },
        subTotalAmt: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        totalAmt: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        invoice_receipt: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
        tableName: "orders", // Table name in the database
    }
);

OrderModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });
OrderModel.belongsTo(ProductModel, { foreignKey: "productId", as: "product" });
OrderModel.belongsTo(AddressModel, { foreignKey: "delivery_address", as: "address" });

export default OrderModel;
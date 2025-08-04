import { DataTypes } from 'sequelize';
import { sequelize } from '../config/connectDB.js';
import AddressModel from './addressModel.js'; // Import the Address model

const UserModel = sequelize.define('User', {

    stripeCustomerID: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Provide name" },
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: { msg: "Provide a valid email" },
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Provide password" },
        },
    },
    avatar: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    mobile: {
        type: DataTypes.STRING, // Use STRING to handle phone numbers with leading zeros
        allowNull: true,
    },
    refresh_token: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    verify_email: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    last_login_date: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
    status: {
        type: DataTypes.ENUM("Active", "Inactive", "Suspended"),
        defaultValue: "Active",
    },
    address_details: {
        type: DataTypes.JSON, // Use JSON to store complex data like arrays
        defaultValue: [],
    },
    shopping_cart: {
        type: DataTypes.JSON, // Use JSON to store complex data like arrays
        defaultValue: [],
    },
    orderHistory: {
        type: DataTypes.JSON, // Use JSON to store complex data like arrays
        defaultValue: [],
    },
    forgot_password_otp: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
    forgot_password_expiry: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
    role: {
        type: DataTypes.ENUM("ADMIN", "USER"),
        defaultValue: "USER",
    },
}, {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    tableName: 'users', // Optional: Specify the table name
});

UserModel.hasMany(AddressModel, { foreignKey: "userId", as: "addresses" });
AddressModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

export default UserModel;
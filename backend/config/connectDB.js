import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Create a Sequelize instance
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE, // Database name
    process.env.MYSQL_USER,     // Username
    process.env.MYSQL_PASSWORD, // Password
    {
        host: process.env.MYSQL_HOST, // Hostname
        dialect: 'mysql',             // Database dialect
        logging: false,               // Disable logging (optional)
    }
);

// Function to connect to the database
async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log("Connected to MySQL Database using Sequelize");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1);
    }
}

export { sequelize, connectDB };
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const { MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST } = process.env;

// Create a Sequelize instance using a single configuration object for clarity
const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, {
    host: MYSQL_HOST,
    dialect: 'mysql',
    logging: false,
});

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log("Connected to MySQL database using Sequelize.");
    } catch (error) {
        console.error("Error connecting to the database:", error.message);
        process.exit(1);
    }
}

export { sequelize, connectDB };
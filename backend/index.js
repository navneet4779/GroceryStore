import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();
import userRouter from './route/userRoute.js';
import productRouter from './route/productRoute.js'
import categoryRouter from './route/categoryRoute.js'
import subcategoryRouter from './route/subcategoryRoute.js'
import cartRouter from './route/cartRoute.js'
import addressRouter from './route/addressRoute.js'
import orderRouter from './route/orderRoute.js'
import { connectDB } from './config/connectDB.js';

const app = express();

// Middleware
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000',
}));
app.use(express.json()); // Add this middleware to parse JSON request bodies
app.use(cookieParser())

const PORT = 8080;

// Root route
app.get("/", (req, res) => {
    res.json({
        message: `Server is running on port ${PORT}`,
    });
});

// User routes
app.use('/api/user', userRouter);
app.use("/api/product",productRouter)
app.use("/api/category",categoryRouter)
app.use("/api/subcategory",subcategoryRouter)
app.use("/api/cart",cartRouter)
app.use("/api/address",addressRouter)
app.use('/api/order',orderRouter)

// Connect to the database and start the server
connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("Server is running",PORT)
    })
})
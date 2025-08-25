import CartProduct from "../models/cartproductModel.js";
import Product from "../models/productModel.js";

// Helper function for consistent error responses
const sendErrorResponse = (response, status, message) => {
    return response.status(status).json({
        message: message,
        error: true,
        success: false,
    });
};

// Helper function for consistent success responses
const sendSuccessResponse = (response, data, message) => {
    return response.json({
        data: data,
        message: message,
        error: false,
        success: true,
    });
};

export const getCartItemController = async (request, response) => {
    try {
        const { userId } = request.body;
        // Fetch cart items for the user and include product details
        const cartItems = await CartProduct.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: 'product',
            }],
        });
        
        return sendSuccessResponse(response, cartItems, "Cart items fetched successfully");

    } catch (error) {
        return sendErrorResponse(response, 500, error.message || "Internal server error");
    }
};

export const addToCartItemController = async (request, response) => {
    try {
        const { productId, userId } = request.body;

        if (!productId) {
            return sendErrorResponse(response, 400, "Provide productId");
        }

        // Check if the item already exists in the cart to prevent duplicates
        const existingCartItem = await CartProduct.findOne({
            where: { userId, productId },
        });

        if (existingCartItem) {
            return sendErrorResponse(response, 400, "Item already in cart");
        }

        // Add the item to the cart with a quantity of 1
        const newCartItem = await CartProduct.create({
            quantity: 1,
            userId,
            productId,
        });

        return sendSuccessResponse(response, newCartItem, "Item added successfully");

    } catch (error) {
        return sendErrorResponse(response, 500, error.message || "Internal server error");
    }
};

export const updateCartItemQtyController = async (request, response) => {
    try {
        const { id, qty } = request.body;

        if (!id || !qty) {
            return sendErrorResponse(response, 400, "Provide id and qty");
        }

        // Update the quantity of the cart item
        const [rowsAffected] = await CartProduct.update(
            { quantity: qty },
            { where: { id } }
        );

        if (rowsAffected === 0) {
            return sendErrorResponse(response, 404, "Cart item not found or no change in quantity");
        }

        return sendSuccessResponse(response, null, "Cart item updated successfully");

    } catch (error) {
        return sendErrorResponse(response, 500, error.message || "Internal server error");
    }
};

export const deleteCartItemController = async (request, response) => {
    try {
        const { id } = request.body; // Standardized variable name to 'id'

        if (!id) {
            return sendErrorResponse(response, 400, "Provide id");
        }

        const rowsDeleted = await CartProduct.destroy({
            where: { id },
        });
        
        if (rowsDeleted === 0) {
            return sendErrorResponse(response, 404, "Cart item not found");
        }

        return sendSuccessResponse(response, null, "Item removed successfully");

    } catch (error) {
        return sendErrorResponse(response, 500, error.message || "Internal server error");
    }
};
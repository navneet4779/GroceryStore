import CartProduct  from "../models/cartproductModel.js"; // Sequelize model for CartProduct
import Product  from "../models/productModel.js"; // Sequelize model for Product
import CartProductModel from "../models/cartproductModel.js"; // Sequelize model for CartProduct

export const getCartItemController = async (request, response) => {
    try {
        //const userId = request.userId;

        // Fetch cart items for the user and include product details
        const cartItems = await CartProduct.findAll({
            //where: { userId: userId },
            include: [
                {
                    model: Product,
                    as: 'product', // Alias for the relationship
                },
            ],
        });

        return response.json({
            data: cartItems,
            error: false,
            success: true,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

export const addToCartItemController = async (request, response) => {
    try {
        //const userId = request.userId;
        const { productId } = request.body;

        if (!productId) {
            return response.status(400).json({
                message: "Provide productId",
                error: true,
                success: false,
            });
        }

        // Check if the item already exists in the cart
        const checkItemCart = await CartProduct.findOne({
            where: {
                //userId: userId,
                productId: productId,
            },
        });

        if (checkItemCart) {
            return response.status(400).json({
                message: "Item already in cart",
                error: true,
                success: false,
            });
        }

        // Add the item to the cart
        const cartItem = await CartProduct.create({
            quantity: 1,
            //userId: userId,
            productId: productId,
        });

        return response.json({
            data: cartItem,
            message: "Item added successfully",
            error: false,
            success: true,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false,
        });
    }
};

export const updateCartItemQtyController = async(request,response)=>{
    try {
        //const userId = request.userId 
        const { id,qty } = request.body

        if(!id ||  !qty){
            return response.status(400).json({
                message : "provide _id, qty"
            })
        }

        // Update the quantity of the cart item
        const updateCartItem = await CartProduct.update(
            { quantity: qty },
            {
                where: {
                    id: id,
                    //userId: userId,
                },
            }
        );

        if (updateCartItem[0] === 0) {
            return response.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false,
            });
        }

        return response.json({
            message: "Cart item updated successfully",
            success: true,
            error: false,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false,
        });
    }
};

export const deleteCartItemQtyController = async(request,response)=>{
    try {
      //const userId = request.userId // middleware
      const { _id } = request.body 
      
      if(!_id){
        return response.status(400).json({
            message : "Provide _id",
            error : true,
            success : false
        })
      }

      const deleteCartItem = await CartProductModel.destroy({
        where: {
            id: _id,
            //userId: userId,
        },
        });

      return response.json({
        message : "Item removed successfully",
        error : false,
        success : true,
        data : deleteCartItem
      })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
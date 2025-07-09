import UserModel from '../models/userModel.js'
import OrderModel from '../models/orderModel.js'
import CartProductModel from '../models/cartproductModel.js'
import ProductModel from '../models/productModel.js'
import AddressModel from '../models/addressModel.js'
import Stripe from "../config/stripe.js";
import Sequelize from 'sequelize'
export async function CashOnDeliveryOrderController(request, response) {
    try {
        //const userId = request.userId; // Auth middleware
        const { list_items, totalAmt, addressId, subTotalAmt,userId } = request.body;

        // Validate addressId
        if (!addressId) {
            return response.status(400).json({
                message: "Please provide a valid address.",
                error: true,
                success: false,
            });
        }

        // Validate list_items
        if (!list_items || !Array.isArray(list_items) || list_items.length === 0) {
            return response.status(400).json({
                message: "Please provide valid list items.",
                error: true,
                success: false,
            });
        }

        await CartProductModel.update(
            { userId: userId },
            { where: {} }
        );

        // Validate each product in the list
        for (const item of list_items) {
            const productExists = await ProductModel.findByPk(item.product.id);

            if (!productExists) {
                return response.status(400).json({
                    message: `Product with ID ${item.product.id} does not exist.`,
                    error: true,
                    success: false,
                });
            }

            // Check if stock is sufficient
            if (productExists.stock < item.quantity) {
                return response.status(400).json({
                    message: `Insufficient stock for product: ${item.product.name}.`,
                    error: true,
                    success: false,
                });
            }
        }

        // Prepare the payload for the order table
        const payload = list_items.map((el) => ({
            userId: userId,
            orderId: `ORD-${Date.now()}`, // Generate unique order ID
            productId: el.product.id, // Assuming Sequelize uses `id`
            product_details: JSON.stringify({
                name: el.product.name,
                image: el.product.image,
            }),
            paymentId: "",
            payment_status: "CASH ON DELIVERY",
            delivery_address: addressId,
            subTotalAmt: subTotalAmt,
            totalAmt: totalAmt,
        }));

        // Create the order in the database
        const generatedOrder = await OrderModel.bulkCreate(payload);

        if (!generatedOrder) {
            return response.status(500).json({
                message: "Failed to create order.",
                error: true,
                success: false,
            });
        }

        // Subtract stock for each product
        for (const item of list_items) {
            await ProductModel.update(
                { stock: Sequelize.literal(`stock - ${item.quantity}`) }, // Decrement stock
                { where: { id: item.product.id } }
            );
        }

        // Remove items from the cart
        await CartProductModel.destroy({
            where: { userId: userId },
        });

        // Clear the user's shopping cart
        await UserModel.update(
            { shopping_cart: [] },
            { where: { id: userId } }
        );

        return response.json({
            message: "Order placed successfully.",
            error: false,
            success: true,
            data: generatedOrder,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || "An error occurred while processing the order.",
            error: true,
            success: false,
        });
    }
}


export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.findAll({
            where: { userId: userId },
            include: [
                {
                    model: AddressModel, // Include the delivery address details
                    as: "address", // Alias for the relationship
                    attributes: ["address_line", "city", "state", "country", "pincode", "mobile","status"], // Select specific fields from the user model
                },
                {
                    model: UserModel, // Include the user details
                    as: "user", // Alias for the relationship
                    attributes: ["name", "email", "mobile"], // Select specific fields from the user model
                },
            ],
            order: [["createdAt", "DESC"]], // Sort by createdAt in descending 
            //logging:console.log // Log the SQL query for debugging
        });

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        if(!addressId){
            return response.status(400).json({
                message : "Provide address",  
                error : true,
                success : false
            })
        }

        const user = await UserModel.findByPk(userId)

        /*const line_items  = list_items.map(item =>{
            console.log("params",item.product.name,item.product.id)
            return{
               price_data : {
                    currency : 'inr',
                    product_data : {
                        name : item.product.name,
                        metadata : {
                            productId : item.product.id
                        }
                    },
                    
                    unit_amount : pricewithDiscount(item.product.price,item.product.discount) * 1000   
               },
               adjustable_quantity : {
                    enabled : true,
                    minimum : 1
               },
               quantity : item.quantity 
            }
            
        })*/

        

        const params = {
            amount : subTotalAmt * 1000, // Amount in paise
            currency : 'usd',
            description : 'Order Payment',
            //confirm : true,
            payment_method_types : ['card'],
            receipt_email : user.email,
            setup_future_usage : 'off_session',
            metadata : {
                userId : userId,
                addressId : addressId
            },
            capture_method : 'automatic',
            //success_url : `${process.env.FRONTEND_URL}/success`,
            //cancel_url : `${process.env.FRONTEND_URL}/cancel`
            //return_url : `${process.env.FRONTEND_URL}/success`
        }
        const session = await Stripe.paymentIntents.create(params)

        return response.status(200).json(session.client_secret )

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function savePaymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, stripeId, addressId, amount, status } = request.body 

        if(!addressId){
            return response.status(400).json({
                message : "Provide address",  
                error : true,
                success : false
            })
        }

        const payload = list_items.map((el) => ({
            userId: userId,
            orderId: `ORD-${Date.now()}`, // Generate unique order ID
            productId: el.product.id, // Assuming Sequelize uses `id`
            product_details: JSON.stringify({
                name: el.product.name,
                image: el.product.image,
            }),
            paymentId: stripeId,
            payment_status: status,
            delivery_address: addressId,
            subTotalAmt: amount,
            totalAmt: amount,
        }));

        // Create the order in the database
        const generatedOrder = await OrderModel.bulkCreate(payload);

        if (!generatedOrder) {
            return response.status(500).json({
                message: "Failed to create order.",
                error: true,
                success: false,
            });
        }

        // Subtract stock for each product
        for (const item of list_items) {
            await ProductModel.update(
                { stock: Sequelize.literal(`stock - ${item.quantity}`) }, // Decrement stock
                { where: { id: item.product.id } }
            );
        }

        // Remove items from the cart
        await CartProductModel.destroy({
            where: { userId: userId },
        });

        // Clear the user's shopping cart
        await UserModel.update(
            { shopping_cart: [] },
            { where: { id: userId } }
        );

    } catch (error) {
        return response.status(500).json({
            message: error.message || "An error occurred while processing the order.",
            error: true,
            success: false,
        });
    }
}
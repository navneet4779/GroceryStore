import UserModel from '../models/userModel.js'
import OrderModel from '../models/orderModel.js'
import CartProductModel from '../models/cartproductModel.js'
import ProductModel from '../models/productModel.js'
import AddressModel from '../models/addressModel.js'
import Stripe from "../config/stripe.js";
import Sequelize from 'sequelize'
import razorpayInstance from '../config/razorpay.js';
import crypto from 'crypto';
export async function CashOnDeliveryOrderController(request, response) {
    try {
        const userId = request.userId; // Auth middleware
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

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
            amount : subTotalAmt, // Amount in paise
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

        return response.json({
            message: "Order created successfully.",
            error: false,
            success: true,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "An error occurred while processing the order.",
            error: true,
            success: false,
        });
    }
}

export async function initiateRazorpayOrderController(request, response) {
   const { amount, currency, list_items, addressId, userId } = request.body;

    if (!amount || !currency || !list_items || !addressId || !userId) {
        return response.status(400).json({ success: false, message: "Missing required order details." });
    }

    const receiptId = `receipt_${Date.now()}_${userId}`; // Unique receipt ID

    const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paisa
        currency: currency,
        receipt: receiptId,
        payment_capture: 1 // Auto capture payment after success
    };

    try {
        const order = await razorpayInstance.orders.create(options);
        //console.log("Razorpay Order Created:", order);
        response.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount, // Amount in paisa
            currency: order.currency,
            message: "Razorpay order created successfully."
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        response.status(500).json({ success: false, message: "Failed to create Razorpay order." });
    }
}

export async function verifyRazorpayPaymentController(request, response) {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        list_items,
        addressId,
        totalAmt,
        userId // User ID passed from frontend
    } = request.body;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET; // Ensure this is set in your environment variables

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !list_items || !addressId || !totalAmt || !userId) {
        return response.status(400).json({ success: false, message: "Missing required verification details." });
    }

    // Verify the signature
    const shasum = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest === razorpay_signature) {
        try {
            // Save the order details in the database
            const orderDetails = list_items.map(item => ({
                userId: userId,
                orderId: `ORD-${Date.now()}`, // Generate unique order ID
                productId: item.product.id, // Assuming Sequelize uses `id` for productId
                product_details: JSON.stringify({
                    name: item.product.name,
                    image: item.product.image,
                }), // Convert to JSON string
                paymentId: razorpay_payment_id,
                payment_status: "succeeded", // Assuming payment is successful
                delivery_address: addressId,
                subTotalAmt: totalAmt,
                totalAmt: totalAmt
            }));
            //console.log("Order Details to be saved:", orderDetails);
            // Save the order details in the database
            await OrderModel.bulkCreate(orderDetails); 
            
            // Update product stock
            for (const item of list_items) {
                await ProductModel.update(
                    { stock: Sequelize.literal(`stock - ${item.quantity}`) }, // Decrement stock
                    { where: { id: item.product.id } }
                );
            }

            // Clear the user's shopping cart
            await UserModel.update(
                { shopping_cart: [] },
                { where: { id: userId } }
            );

            // Remove items from the cart
            await CartProductModel.destroy({    
                where: { userId: userId },
            });

            //console.log(`Payment successfully verified for Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);
            response.status(200).json({ success: true, message: "Payment verified successfully and order placed!" });

        } catch (error) {
            console.error("Error saving order after Razorpay verification:", error);
            response.status(500).json({ success: false, message: "Payment verified, but failed to save order." });
        }
    } else {
        console.error("Razorpay signature mismatch!");
        response.status(400).json({ success: false, message: "Invalid payment signature." });
    }
}
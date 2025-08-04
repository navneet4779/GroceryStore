import UserModel from '../models/userModel.js'
import OrderModel from '../models/orderModel.js'
import CartProductModel from '../models/cartproductModel.js'
import ProductModel from '../models/productModel.js'
import AddressModel from '../models/addressModel.js'
import Stripe from "../config/stripe.js";
import Sequelize from 'sequelize'
import razorpayInstance from '../config/razorpay.js';
import crypto from 'crypto';
import axios from 'axios';


async function saveOrderToDatabase({ userId, list_items, paymentId = "", payment_status = "CASH ON DELIVERY", addressId, subTotalAmt, totalAmt }) {
    const orderId = `ORD-${Date.now()}`; // Generate unique order ID
    const payload = list_items.map((el) => ({
        userId: userId,
        orderId: orderId,
        productId: el.product.id,
        product_details: JSON.stringify({
            name: el.product.name,
            image: el.product.image,
        }),
        paymentId: paymentId,
        payment_status: payment_status,
        delivery_address: addressId,
        subTotalAmt: subTotalAmt,
        totalAmt: totalAmt,
    }));

    // Save order(s) to DB
    const generatedOrder = await OrderModel.bulkCreate(payload);

    // Optionally, call Tookan API and update order
    try {
        const getDarkStoreInfo = () => ({
            address: "B-21, Sector 63, Noida, Uttar Pradesh 201301",
            latitude: 28.6256,
            longitude: 77.3824
        });
        const darkStore = getDarkStoreInfo();
        const tookanApiUrl = 'https://api.tookanapp.com/v2/create_task';
        const tookanPayload = {
            api_key: process.env.TOOKAN_API_KEY,
            order_id: generatedOrder[0].id.toString(),
            job_description: `Delivery for Order #${generatedOrder[0].id}. Items: ${list_items.map(item => item.product.name).join(', ')}`,
            job_pickup_phone: '8429656207',
            job_pickup_address: darkStore.address,
            job_pickup_latitude: darkStore.latitude,
            job_pickup_longitude: darkStore.longitude,
            job_pickup_datetime: new Date(Date.now()),
            job_delivery_datetime: new Date(Date.now() + 10 * 60 * 1000),
            auto_assignment: 1,
            has_pickup: 1,
            has_delivery: 0,
            layout_type: 0,
            tracking_link: 1,
            timezone: 300,
            fleet_id: "",
            p_ref_images: [
                "http://tookanapp.com/wp-content/uploads/2015/11/logo_dark.png"
            ],
            notify: 1,
            tags: "",
            geofence: 0,
        };
        const tookanResponse = await axios.post(tookanApiUrl, tookanPayload);

        if (tookanResponse.data.status === 200) {
            // Update the first order record with Tookan info
            generatedOrder[0].tookanTaskId = tookanResponse.data.data.job_id;
            generatedOrder[0].deliveryStatus = 'Assigned';
            await generatedOrder[0].save();
        } else {
            generatedOrder[0].deliveryStatus = 'Tookan Assignment Failed';
            await generatedOrder[0].save();
        }
    } catch (err) {
        // Optionally log Tookan error, but do not send response here
        console.error('Tookan API Error:', err);
    }

    return generatedOrder;
}
export async function CashOnDeliveryOrderController(request, response) {
    try {
        const userId = request.userId;
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

        if (!addressId) {
            return response.status(400).json({
                message: "Please provide a valid address.",
                error: true,
                success: false,
            });
        }
        if (!list_items || !Array.isArray(list_items) || list_items.length === 0) {
            return response.status(400).json({
                message: "Please provide valid list items.",
                error: true,
                success: false,
            });
        }

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
            if (productExists.stock < item.quantity) {
                return response.status(400).json({
                    message: `Insufficient stock for product: ${item.product.name}.`,
                    error: true,
                    success: false,
                });
            }
        }

        // Save order
        const generatedOrder = await saveOrderToDatabase({
            userId,
            list_items,
            paymentId: "",
            payment_status: "CASH ON DELIVERY",
            addressId,
            subTotalAmt,
            totalAmt,
        });

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
                { stock: Sequelize.literal(`stock - ${item.quantity}`) },
                { where: { id: item.product.id } }
            );
        }

        // Remove items from the cart
        await CartProductModel.destroy({ where: { userId: userId } });

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

export async function createStripeCustomerController(request, response) {
    try {
        const userId = request.body.userId;
        const user = await UserModel.findByPk(userId);

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        // Check if a Stripe customer ID already exists for the user
        if (user.stripeCustomerID) {
            return response.json({
                message: "Stripe customer already exists",
                customerId: user.stripeCustomerID,
                error: false,
                success: true,
            });
        }

        let userEmail = user.email;
        let userName = user.name;

        const customer = await Stripe.customers.create({
            email: userEmail,
            name: userName,
        });

        user.stripeCustomerID = customer.id;
        await user.save();

        return response.json({
            message: "Stripe customer created successfully",
            customerId: customer.id,
            error: false,
            success: true,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || "An error occurred while creating the Stripe customer.",
            error: true,
            success: false,
        });
    }
}

export async function getPaymentMethodsController(request, response) {
    try {
        // Assuming customerId is passed as a query parameter or body
        const { customerId } = request.query; // Or request.body
        const user = await UserModel.findOne({ where: { stripeCustomerID: customerId } });
        
        if (!user || !user.stripeCustomerID) {
            return response.status(404).json({
                message: "Stripe customer not found",
                error: true,
                success: false,
            });
        }

        const paymentMethods = await Stripe.paymentMethods.list({
            customer: user.stripeCustomerID,
            type: 'card',
        });

        return response.json({
            message: "Payment methods retrieved successfully",
            data: paymentMethods.data,
            error: false,
            success: true,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || "An error occurred while retrieving payment methods.",
            error: true,
            success: false,
        });
    }
}

export async function paymentController(request, response) {
    try {
        const userId = request.userId;
        const {
            subTotalAmt,
            addressId,
            stripeCustomerId,
            paymentMethodId,
            saveCard
        } = request.body;

        if (!addressId || !subTotalAmt || !stripeCustomerId) {
            return response.status(400).json({
                message: "Missing required payment details.",
                error: true,
                success: false,
            });
        }

        const user = await UserModel.findByPk(userId);
        if (!user) {
            return response.status(404).json({ message: "User not found.", error: true, success: false });
        }

        const customerId = stripeCustomerId;

        let paymentIntent;
        
        // ✅ If saved card (paymentMethodId starts with "pm_"), confirm here
        if (paymentMethodId && paymentMethodId !== 'new') {
            paymentIntent = await Stripe.paymentIntents.create({
                amount: Math.round(subTotalAmt * 100),
                currency: 'inr',
                customer: customerId,
                payment_method: paymentMethodId,
                confirm: true,
                setup_future_usage: saveCard ? 'off_session' : undefined,
                metadata: { userId, addressId },
                description: 'Grocery Order Payment',
                receipt_email: user.email,
                automatic_payment_methods: { enabled: true, allow_redirects: 'never' },

            });
        } else {
            // 🔁 New card: do NOT confirm, let frontend confirm
            paymentIntent = await Stripe.paymentIntents.create({
                amount: Math.round(subTotalAmt * 100),
                currency: 'inr',
                customer: customerId,
                setup_future_usage: saveCard ? 'off_session' : undefined,
                metadata: { userId, addressId },
                description: 'Grocery Order Payment',
                receipt_email: user.email,
                automatic_payment_methods: { enabled: true },
            });
        }

        return response.status(200).json({
            success: true,
            paymentIntentStatus: paymentIntent.status,
            clientSecret: paymentIntent.client_secret,
            stripeId: paymentIntent.id,
        });

    } catch (error) {
        console.error("❌ Stripe Payment Error:", error);

        if (error.type === 'StripeCardError') {
            return response.status(402).json({
                message: error.message,
                error: true,
                success: false,
            });
        }

        return response.status(500).json({
            message: error.message || "An internal server error occurred.",
            error: true,
            success: false,
        });
    }
}



export async function savePaymentController(request, response) {
    try {
        const userId = request.userId;
        const { list_items, stripeId, addressId, amount, status } = request.body;

        if (!addressId) {
            return response.status(400).json({
                message: "Provide address",
                error: true,
                success: false
            });
        }

        // Save order
        const generatedOrder = await saveOrderToDatabase({
            userId,
            list_items,
            paymentId: stripeId,
            payment_status: status,
            addressId,
            subTotalAmt: amount,
            totalAmt: amount,
        });

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
                { stock: Sequelize.literal(`stock - ${item.quantity}`) },
                { where: { id: item.product.id } }
            );
        }

        // Remove items from the cart
        await CartProductModel.destroy({ where: { userId: userId } });

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
        userId
    } = request.body;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

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
            await saveOrderToDatabase({
                userId,
                list_items,
                paymentId: razorpay_payment_id,
                payment_status: "succeeded",
                addressId,
                subTotalAmt: totalAmt,
                totalAmt: totalAmt,
            });

            // Update product stock
            for (const item of list_items) {
                await ProductModel.update(
                    { stock: Sequelize.literal(`stock - ${item.quantity}`) },
                    { where: { id: item.product.id } }
                );
            }

            // Clear the user's shopping cart
            await UserModel.update(
                { shopping_cart: [] },
                { where: { id: userId } }
            );

            // Remove items from the cart
            await CartProductModel.destroy({ where: { userId: userId } });

            response.status(200).json({ success: true, message: "Payment verified successfully and order placed!" });

        } catch (error) {
            response.status(500).json({ success: false, message: "Payment verified, but failed to save order." });
        }
    } else {
        response.status(400).json({ success: false, message: "Invalid payment signature." });
    }
}
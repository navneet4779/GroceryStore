import UserModel from '../models/userModel.js'
import OrderModel from '../models/orderModel.js'
import CartProductModel from '../models/cartproductModel.js'
import ProductModel from '../models/productModel.js'
import AddressModel from '../models/addressModel.js'
import Stripe from "../config/stripe.js";
import Sequelize from 'sequelize'
export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 
        console.log("list_items",addressId)
        if(!addressId){
            return response.status(400).json({
                message : "Provide address",  
                error : true,
                success : false
            })
        }

        for (const item of list_items) {
            const productExists = await ProductModel.findByPk(item.product.id);
            if (!productExists) {
                return response.status(400).json({
                    message: `Product with ID ${item.product.id} does not exist`,
                    error: true,
                    success: false,
                });
            }
        // Check if stock is sufficient
        if (productExists.stock < item.quantity) {
            return response.status(400).json({
                message: `Insufficient stock for product: ${item.product.name}`,
                error: true,
                success: false,
            });
        }
    }

        const payload = list_items.map((el) => {
            return {
                userId: userId,
                orderId: `ORD-${Date.now()}`, // Generate unique order ID
                productId: el.product.id, // Assuming Sequelize uses `id` instead of `_id`
                product_details: JSON.stringify({
                    name: el.product.name,
                    image: el.product.image,
                }),
                paymentId: "",
                payment_status: "CASH ON DELIVERY",
                delivery_address: addressId,
                subTotalAmt: subTotalAmt,
                totalAmt: totalAmt,
            };
        });

        const generatedOrder = await OrderModel.bulkCreate(payload);

        // Subtract stock for each product
        for (const item of list_items) {
            await ProductModel.update(
                { stock: Sequelize.literal(`stock - ${item.quantity}`) }, // Decrement stock
                { where: { id: item.product.id } }
            );
        }

        ///remove from the cart
        await CartProductModel.destroy({
            where: { userId: userId },
        });
        await UserModel.update(
            { shopping_cart: [] },
            { where: { id: userId } }
        );

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
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
            logging:console.log // Log the SQL query for debugging
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

        const line_items  = list_items.map(item =>{
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
            
        })

        

        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card'],
            customer_email : user.email,
            metadata : {
                userId : userId,
                addressId : addressId
            },
            line_items : line_items,
            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`
        }

        const session = await Stripe.checkout.sessions.create(params)

        return response.status(200).json(session)

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
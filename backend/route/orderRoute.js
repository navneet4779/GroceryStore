import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, getOrderDetailsController, paymentController, savePaymentController, initiateRazorpayOrderController, verifyRazorpayPaymentController, createStripeCustomerController, getPaymentMethodsController } from '../controllers/orderController.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.post('/checkout',auth,paymentController)
orderRouter.post('/create-stripe-customer', auth, createStripeCustomerController)
orderRouter.post('/get-payment-methods', auth, getPaymentMethodsController)
orderRouter.post('/save-payment',auth,savePaymentController)
orderRouter.post('/initiate-razorpay-order', auth, initiateRazorpayOrderController)
// The endpoint to verify Razorpay payment
orderRouter.post('/verify-razorpay-payment', auth, verifyRazorpayPaymentController)

export default orderRouter
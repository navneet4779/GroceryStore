import { Router } from 'express'
import auth from '../middleware/auth.js'
import {getCartItemController,addToCartItemController,updateCartItemQtyController,deleteCartItemQtyController} from '../controllers/cartController.js'

const cartRouter = Router()


cartRouter.get("/get",auth,getCartItemController)
cartRouter.post('/create',auth,addToCartItemController)
cartRouter.put('/update-qty',auth,updateCartItemQtyController)
cartRouter.delete('/delete-cart-item',auth,deleteCartItemQtyController)


export default cartRouter
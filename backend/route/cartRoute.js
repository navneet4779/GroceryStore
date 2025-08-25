import { Router } from 'express'
import auth from '../middleware/auth.js'
import {getCartItemController,addToCartItemController,updateCartItemQtyController,deleteCartItemController} from '../controllers/cartController.js'

const cartRouter = Router()


cartRouter.post("/get",getCartItemController)
cartRouter.post('/create',addToCartItemController)
cartRouter.put('/update-qty',updateCartItemQtyController)
cartRouter.delete('/delete-cart-item',deleteCartItemController)


export default cartRouter
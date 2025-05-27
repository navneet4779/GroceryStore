import { Router } from 'express'
import auth from '../middleware/auth.js'
import {getCartItemController,addToCartItemController,updateCartItemQtyController,deleteCartItemQtyController} from '../controllers/cartController.js'

const cartRouter = Router()


cartRouter.get("/get",getCartItemController)
cartRouter.post('/create',addToCartItemController)
cartRouter.put('/update-qty',updateCartItemQtyController)
cartRouter.delete('/delete-cart-item',deleteCartItemQtyController)


export default cartRouter
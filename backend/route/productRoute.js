import { Router } from 'express'
//import auth from '../middleware/auth.js'
import {  searchProduct,getProductDetails,getProductByCategory} from '../controllers/productController.js'
//import { admin } from '../middleware/Admin.js'

const productRouter = Router()

//search product 
productRouter.post('/search-product',searchProduct)
productRouter.post('/get-product-details',getProductDetails)
productRouter.post("/get-product-by-category",getProductByCategory)


export default productRouter
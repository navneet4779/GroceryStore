import { Router } from 'express'
import auth from '../middleware/auth.js'
import {  searchProduct,getProductDetails,getProductByCategory,getProductByCategoryAndSubCategory,getProductController,createProductController} from '../controllers/productController.js'
//import { admin } from '../middleware/Admin.js'

const productRouter = Router()

//search product 
productRouter.post('/search-product',searchProduct)
productRouter.post('/get-product-details',getProductDetails)
productRouter.post("/get-product-by-category",getProductByCategory)
productRouter.post('/get-pruduct-by-category-and-subcategory',getProductByCategoryAndSubCategory)
productRouter.post('/get',getProductController)
productRouter.post("/create",auth,createProductController)


export default productRouter
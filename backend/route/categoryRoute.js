import { Router } from 'express'
import auth from '../middleware/auth.js'
import {getCategoryController,AddCategoryController,updateCategoryController,deleteCategoryController} from '../controllers/categoryController.js'

const categoryRouter = Router()


categoryRouter.get('/get',getCategoryController)
categoryRouter.post("/add-category",auth,AddCategoryController)
categoryRouter.put("/update",auth,updateCategoryController)
categoryRouter.delete("/delete",auth,deleteCategoryController)


export default categoryRouter
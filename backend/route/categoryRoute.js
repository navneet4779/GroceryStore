import { Router } from 'express'
import auth from '../middleware/auth.js'
import {getCategoryController,AddCategoryController} from '../controllers/categoryController.js'

const categoryRouter = Router()


categoryRouter.get('/get',getCategoryController)
categoryRouter.post("/add-category",auth,AddCategoryController)


export default categoryRouter
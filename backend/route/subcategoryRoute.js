import { Router } from 'express'
import auth from '../middleware/auth.js'
import {getSubCategoryController,AddSubCategoryController} from '../controllers/subCategoryController.js'

const subCategoryRouter = Router()


subCategoryRouter.post('/get',getSubCategoryController)
subCategoryRouter.post('/create',auth,AddSubCategoryController)



export default subCategoryRouter

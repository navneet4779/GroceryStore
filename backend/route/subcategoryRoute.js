import { Router } from 'express'
//import auth from '../middleware/auth.js'
import {getSubCategoryController} from '../controllers/subCategoryController.js'

const subCategoryRouter = Router()


subCategoryRouter.post('/get',getSubCategoryController)



export default subCategoryRouter

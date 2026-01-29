import { Router } from 'express'
import auth from '../middleware/auth.js'
import {getSubCategoryController,AddSubCategoryController,updateSubCategoryController,deleteSubCategoryController} from '../controllers/subCategoryController.js'

const subCategoryRouter = Router()


subCategoryRouter.post('/get',getSubCategoryController)
subCategoryRouter.post('/create',auth,AddSubCategoryController)
subCategoryRouter.put('/update',auth,updateSubCategoryController)
subCategoryRouter.delete('/delete',auth,deleteSubCategoryController)



export default subCategoryRouter

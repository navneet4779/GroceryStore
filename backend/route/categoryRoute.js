import { Router } from 'express'
//import auth from '../middleware/auth.js'
import {getCategoryController} from '../controllers/categoryController.js'

const categoryRouter = Router()


categoryRouter.get('/get',getCategoryController)


export default categoryRouter
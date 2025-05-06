import { Router } from 'express'
import auth from '../middleware/auth.js'
import { addAddressController, getAddressController, deleteAddresscontroller } from '../controllers/addressController.js'

const addressRouter = Router()

addressRouter.post('/create',auth,addAddressController)
addressRouter.get("/get",auth,getAddressController)
addressRouter.delete("/disable",auth,deleteAddresscontroller)

export default addressRouter
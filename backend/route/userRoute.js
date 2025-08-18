import { Router } from 'express'
import { sendOtpController, verifyOtpController,userDetails,logoutController,updateUserDetails,refreshToken } from '../controllers/userController.js'
import auth from '../middleware/auth.js'
//import upload from '../middleware/multer.js'

const userRouter = Router()

userRouter.post('/send-otp',sendOtpController)
userRouter.post('/verify-otp',verifyOtpController)
userRouter.get('/user-details',auth,userDetails)
userRouter.get('/logout',auth,logoutController)
userRouter.put('/update-user',auth,updateUserDetails)
userRouter.post('/refresh-token',refreshToken)



export default userRouter
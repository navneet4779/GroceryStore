import { Router } from 'express'
import { sendOtpController, verifyOtpController,userDetails,logoutController,updateUserDetails,refreshToken,forgotPasswordController,verifyForgotPasswordOtp,resetpassword } from '../controllers/userController.js'
import auth from '../middleware/auth.js'
//import upload from '../middleware/multer.js'

const userRouter = Router()

userRouter.post('/send-otp',sendOtpController)
userRouter.post('/verify-otp',verifyOtpController)
userRouter.get('/user-details',auth,userDetails)
userRouter.get('/logout',auth,logoutController)
userRouter.put('/update-user',auth,updateUserDetails)
userRouter.post('/refresh-token',refreshToken)
userRouter.put('/forgot-password',forgotPasswordController)
userRouter.put('/verify-forgot-password-otp',verifyForgotPasswordOtp)
userRouter.put('/reset-password',resetpassword)


export default userRouter
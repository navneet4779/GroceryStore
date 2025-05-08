import { Router } from 'express'
import { registerUserController, loginController,userDetails,logoutController,updateUserDetails,refreshToken,forgotPasswordController,verifyForgotPasswordOtp,resetpassword } from '../controllers/userController.js'
import auth from '../middleware/auth.js'
//import upload from '../middleware/multer.js'

const userRouter = Router()

userRouter.post('/register',registerUserController)
userRouter.post('/login',loginController)
userRouter.get('/user-details',auth,userDetails)
userRouter.get('/logout',auth,logoutController)
userRouter.put('/update-user',auth,updateUserDetails)
userRouter.post('/refresh-token',refreshToken)
userRouter.put('/forgot-password',forgotPasswordController)
userRouter.put('/verify-forgot-password-otp',verifyForgotPasswordOtp)
userRouter.put('/reset-password',resetpassword)


export default userRouter
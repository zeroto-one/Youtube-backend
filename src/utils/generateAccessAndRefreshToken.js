import { ApiError } from "./ApiError.js"
import { User } from "../models/user.model.js"
export const generateAccessAndRefreshToken=async (userId)=>{
    try{
       const user= await User.findById(userId)
       console.log(user,"this is in genrateAccessAndRefreshToken uils")
       //
       const accessToken=user.generateAccessToken();
       const refreshToken=user.generateRefreshToken();
        //we need to add refresh token in db as well 
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})//here it will check 
        return {accessToken,refreshToken}
    }
    catch(error){
        throw new ApiError(500,error,"Error generating access and refresh token") 
    }

}
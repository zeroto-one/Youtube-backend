//TODO this is verify ki user hen ya nhi hen

import  jwt  from "jsonwebtoken";
import { ApiError } from "../utlis/ApiError.js";
import asyncHandler from "../utlis/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
 try{
    const token =
    req.cookies?.accessToken ||
    req.header("Authorization").replace("Bearer ", "");
  //ye header wala postman se we get as Bearer <token>
  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }
  const decodedTokenInfo = await jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET
  ); //jwt will take token and secret key to verify
  const user= await User.findById(decodedTokenInfo?._id).select(
    "-password -refreshToken" //yeh password and refreshToken nhi dekhega
  )
  if(!user){
    //TODO discuss about frontend here later
    throw new ApiError(401,"Invalid access token ")
  }
  req.user=user;//by this we are giving access of our user to logout 
  
  next();
 }catch(error){
    if(error instanceof jwt.TokenExpiredError){
      throw new ApiError(401,"Access token expired")
    }
    if(error instanceof jwt.JsonWebTokenError){
      throw new ApiError(401,"Invalid access token")
    }
    throw error;
 }

});

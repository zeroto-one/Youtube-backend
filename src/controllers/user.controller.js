import asyncHandler from "../utlis/asyncHandler.js";

// Example usage of asyncHandler middleware
//* when /user/register pe post req ani then registerUser fun call ho jani 
export const registerUser= asyncHandler(async(req,res)=>{
    res.status(200).json({
        success:true,
        message:"User registered successfully"
    })
})
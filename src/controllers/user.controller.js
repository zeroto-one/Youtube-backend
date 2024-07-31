import asyncHandler from "../utlis/asyncHandler.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utlis/apiError.js";
import {uploadOnCloudinary} from "../utlis/cloudinary.js"
import { ApiResponse } from "../utlis/apiResponse.js";
// Example usage of asyncHandler middleware
//* when /user/register pe post req ani then registerUser function call ho jani
export const registerUser = asyncHandler(async (req, res) => {
  //TODO steps
  //TODO get user details from frontend (req.body se yaha pe)
  //TODO validation on user data
  //TODO   check if user is already exist via email or username
  //TODO  check for images and check for avatar
  //TODO  if yes images are there upload them to cloudinary check if avatar got uploaded or not
  //TODO  now we will crate a obj - and create a entry in DB
  //TODO  now we will have send res or remove password and refresh token from them imp how we remove
  //TODO check if user got created or not ya null response aya hen
  //TODO  return res or ni hua to error bej do 
  //
  //get the data from request body
  const { username, fullname, email, password } = req.body;
  console.log(email,username);

  //validate the fields
  if (//document this
    [username, fullname, email, password].some((index) => index?.trim() === "")
  )
   throw new apiError(400, "All fields are required");

  //check if the email already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }], //use this syntax isme we can se if username ya email dono me ke koi ak bhi hn ya nhi
  });
  if (existingUser) {
   throw new apiError(409, "user with email or username already exist ");
  }

  //password validation using regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password))
    throw new apiError(//why this is not working ?
      400,
      "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
  //email validation using email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email",
    });

    //file handling 
    console.log(req.files.avatar);
    const avatarLocalPath =req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.avatar[0]?.path;
    if(!avatarLocalPath){
        throw new apiError(400, "Avatar is a required field");
    }
    const avatar= await uploadOnCloudinary(avatarLocalPath);
    
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new apiError(500, "Error uploading avatar ");
    }
    const user = await User.create(
        {
            fullname,
            avatar:avatar.url,
            coverImage:coverImage?.url||"",//if coverImage store url else store ""
            email,
            username:username.toLowercase,
            password,

        }
    )
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new apiError(500, " User not created db create krte time error aya");
    }

    res.status(201).json(
        new ApiResponse(201,createdUser,"User registered Successfully")
    );
  []
});


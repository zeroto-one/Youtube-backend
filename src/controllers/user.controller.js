import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/generateAccessAndRefreshToken.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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
    console.log(email, username);

    //validate the fields
    if (
        //document this
        [username, fullname, email, password].some(
            (index) => index?.trim() === ""
        )
    )
        throw new ApiError(400, "All fields are required");

    //check if the email already exists
    const existingUser = await User.findOne({
        $or: [{ username }, { email }], //use this syntax isme we can se if username ya email dono me ke koi ak bhi hn ya nhi
    });
    if (existingUser) {
        throw new ApiError(409, "user with email or username already exist ");
    }

    //password validation using regex

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password.trim()))
        throw new ApiError(
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
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files?.coverImage) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is a required field");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }
    if (!avatar) {
        throw new ApiError(500, "Error uploading avatar ");
    }
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", //if coverImage store url else store ""
        email,
        username: username.toLowerCase(),
        password,
    });
    //console.log(user);
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    //console.log(createdUser);
    if (!createdUser) {
        throw new ApiError(
            500,
            " User not created db create krte time error aya"
        );
    }

    res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    );
    [];
});
//is there ant bug is loginUser

export const loginUser = asyncHandler(async (req, res) => {
    //TODO get data from frontend username/email and password
    //TODO validate user and email kya user ne diya hen ye ?
    //TODO if valid then generate jwt token and send it to frontend via cookie secure wali
    //TODO return success message
    //TODO if not valid then send error message
    console.log(req.body);
    const { email, username, password } = req.body; // Add a default empty object to prevent undefined error
    console.log(email, username);

    if (!username && !email) {
        throw new ApiError(400, "Please provide a username or email");
    }
    const user = await User.findOne({ $or: [{ username }, { email }] });
    console.log(user);
    if (!user) {
        throw new ApiError(
            404,
            "user does not exist,write a valid username or email"
        );
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password please try again");
    }
    //
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );
    //now add access and refresh token to user in db
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    //now send access token and refresh token to frontend via cookie secure wali
    //TODO secure cookie for httpOnly and secure flag true  and same domain name
    const options = {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), //30 days
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { email, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});
export const logoutUser = asyncHandler(async (req, res) => {
    //TODO clear cookies
    //TODO remove access and refresh token from DB as well
    //TODO but issue is user kaha se laye ye cookie clear kisi kre or db kese access kre user to hen nhai hamare pas
    //TODO so we can use a middleware to clear cookies and remove access and refresh token from db
    console.log(" hit logout");
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
            runValidators: true, //what is this
            useFindAndModify: false, //this will protect us from IDOR vulnerability read more about this
        }
    );
    const options = {
        expires: new Date(Date.now() - 1),
        httpOnly: true,
        secure: true,
    };
    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User successfully logged out"));
});
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "No refresh token provided");
    }
    try {
        const decodedInfo = verifyJWT(
            incomingRefreshToken,
            `${process.env.REFRESH_TOKEN_SECRET}`
        );
        if (!decodedInfo) {
            throw new ApiError(401, "Wrong refresh Token");
        }
        const user = await User.findById(decodedInfo._id).select("-password");
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token expired or used");
        }
        try {
            const { newAccessToken, newRefreshToken } =
                await generateAccessAndRefreshToken(user._id);
            user.accessToken = newAccessToken;
            user.refreshToken = newRefreshToken;
            await user.save({ validateBeforeSave: false });
            const options = {
                httpOnly: true,
                secure: true,
            };
            return res
                .status(200)
                .cookie("accessToken", newAccessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        { email: user.email, newAccessToken, newRefreshToken },
                        "User logged in successfully via refresh token"
                    )
                );
        } catch (error) {
            console.error(error);
            throw new ApiError(500, "Error generating new tokens");
        }
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Server error while refreshing accessToken");
    }
});

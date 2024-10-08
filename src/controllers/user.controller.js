import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/generateAccessAndRefreshToken.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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
    console.log(avatar);
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
    console.log(11);

    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    console.log(incomingRefreshToken);
    if (!incomingRefreshToken) {
        throw new ApiError(401, "No refresh token provided");
    }
    try {
        console.log(1);
        const decodedInfo = jwt.verify(
            incomingRefreshToken,
            `${process.env.REFRESH_TOKEN_SECRET}`
        );
        console.log(decodedInfo);
        console.log(2);
        if (!decodedInfo) {
            throw new ApiError(401, "Wrong refresh Token 201 line");
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
export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ApiError(
            400,
            "Please giver currentPassword ,newPassword , confirmPassword"
        );
    }
    if (!(newPassword === confirmPassword)) {
        throw new ApiError(400, "Passwords do not match ,please try again");
    }
    const user = await User.findById(req.user?._id); //as this req.user don't have password
    //first check if current password is correct
    console.log(currentPassword);
    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    console.log(2);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid old Password");
    }
    console.log(3);
    //now validate new password
    // const passwordRegex =
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;//
    // if (!passwordRegex.test(newPassword.trim())){
    //     throw new ApiError(
    //         400,
    //         "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character"//
    //     );
    // }

    console.log(newPassword);
    //now update password in db
    user.password = newPassword; //before saving changed password pre-hook will always get applied and it will hash the password
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password updated successfully"));
});
export const getCurrentUser = asyncHandler(async (req, res) => {
    //user is already present in req so directly send it
    res.status(200).json(
        new ApiResponse(200, req.user, "User retrieved successfully")
    );
});
export const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;
    if (!fullname || !email) {
        throw new ApiError(400, "Fullname or email one of them is required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            fullname,
            email,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Details updated Successfully"));
});
export const updateUserAvatar = asyncHandler(async (req, res) => {
    const localFilePath = req.file?.path;
    if (!localFilePath) {
        throw new ApiError(400, "No image uploaded");
    }
    const avatar = await uploadOnCloudinary(localFilePath);
    if (!avatar) {
        throw new ApiError(500, "Error uploading avatar to cloudinary");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: avatar.url },
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    ).select("-password");
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Avatar updated Successfully"));
});
export const updateUserCoverImage = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "User is not authenticated");
    }
    const oldImagePath = req.user.coverImage;
    console.log(req.user);
    //const coverImageLocalPath = req.file?.path
    const localFilePath = req.file?.path;
    console.log(localFilePath);
    if (!localFilePath) {
        throw new ApiError(400, "No cover image uploaded");
    }
    const coverImage = await uploadOnCloudinary(localFilePath);
    if (!coverImage) {
        throw new ApiError(500, "Error uploading cover image to cloudinary");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { coverImage: coverImage.url },
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Image updated Successfully"));
});

export const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is required");
    }
    const trimmedUsername = username.trim();
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions", //Subscription this is name given by us but in db Subscription=>subscriptions
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo", //mene kisko subscribe kr rekha hen
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {//explain me thi
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);
    console.log(channel);
    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel fetched Successfully"
            )
        );
});

/*export const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"  // array
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $addFields: {
                videosCount: {
                    $size: "$videos",
                },
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                videosCount: 1,
                about: 1
            }
        }

    ]) // will return array

    console.log(channel);
    if (!channel?.length) {
        throw new ApiError(404, "channel doesnot exists")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully")
        )

})
        */
export const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {//user collection me se srf current user ka data hen ab tak 
                _id: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {// ab yaha jo watch history array hen usme jo jo video hen uske related info aagyi watchHistory naam me new array me 
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                        coverImage: 1,
                                        email: 1,
                                        _id: 0,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].WatchHistory,
                "Watch History Fetched Successfully"
            )
        );
});

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse";
import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";

export const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });
    if (existingSubscription) {
        await existingSubscription.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Subscription deleted"));
    }

    const newSubscription = await Subscription.create({
        subscriber: userId,
        channel: channelId,
    });
    return res
        .status(200)
        .json(new ApiResponse(200, newSubscription, "Subscription created"));
});
export const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const channelId = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    const subscribers = (
        await Subscription.find({ channel: channelId }).populate(
            "subscriber",
            "username fullname email avatar"
        )
    ).exec();
    const numberOfSubscribers =subscribers.length;
    return res
    .status(200)
    .json(new ApiResponse(200,{subscribers,numberOfSubscribers},"Subscribed users and number of subscribers fetched successfully"));

});

export const getSubscribedChannel= asyncHandler(async(req,res)=>{
    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(401,"User not authenticated");
    }
    const subscribedTo= await Subscription.find({subscriber:userId}).populate("channel","username avatar email fullname");
    if(!subscribedTo){
        return res.status(200).json(new ApiResponse(200,{subscribedTo:[]},"No subscribed channel found"));
    }
    return res.status(200).json(new ApiResponse(200,{subscribedTo},"Subscribed channels fetched successfully"));

})

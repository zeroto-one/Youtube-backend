import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Subscription } from "../models/subscription.model.js";

export const uploadVideo = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(400, "Please login");
    }

    // Validate req.body
    if (!req.body.title || !req.body.description) {
        throw new ApiError(400, "Title and description are required");
    }

    // Validate req.files
    if (!req.files || !req.files.video || !req.files.thumbnail) {
        throw new ApiError(400, "Video and thumbnail files are required");
    }

    const videoLocalPath = req.files.video[0].path;
    const thumbnailLocalPath = req.files.thumbnail[0].path;

    try {
        const videoUploadResult = await uploadOnCloudinary(videoLocalPath);
        const thumbnailUploadResult = await uploadOnCloudinary(
            thumbnailLocalPath
        );

        if (!videoUploadResult || !thumbnailUploadResult) {
            throw new ApiError(500, "Error uploading video or thumbnail");
        }

        const videoData = {
            title: req.body.title.trim(),
            description: req.body.description.trim(),
            videoId: videoUploadResult.data.url,
            thumbnailId: thumbnailUploadResult.data.url,
            duration: videoUploadResult.data.duration,
        };

        const video = await Video.create(videoData);

        res.status(201).json({
            success: true,
            data: video,
        });
    } catch (error) {
        throw new ApiError(500, error, "Error uploading video");
    }
});
//Delete Video controller
/* 
TODO :get id from params 
TODO :validate that id if that exist or not
todo: find video by id 
todo :check if the user logged in is the owner of the video 
todo :delete that media from cloudinary 
todo :delete that url of that  media from DB , also the thumbnail 
todo :return res of success or failure 
 */
export const deleteVideo = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(400, "Please login");
    }
    const { id } = req.params;
    const userId = req.user._id; //this is to validate if the owner of the video is same as video deleter
    //find video by id
    const video = await Video.findById(id);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    //check if the user logged in is the owner of the video
    if (video.userId.toString() !== userId.toString()) {
        throw new ApiError(401, "You are not authorized to delete this video");
    }
    //delete that media from cloudinary
    await video.deleteMediaFromCloudinary(video.videoId, "video", video.title);
    await video.deleteMediaFromCloudinary(
        video.thumbnailId,
        "image",
        "thumbnail"
    );
    //delete that url of that  media from DB
    await video.deleteOne({ _id: id });
    //return res of success or failure
    res.status(200).json({
        success: true,
        message: "Video deleted successfully",
    });
});
//get all video controller
/*
todo:
*/
export const getAllVideos = asyncHandler(async (req, res) => {
    try {
        const video = await Video.find({}).populate(
            "owner",
            "username fullname avatar"
        );
        if (!video || video.length === 0) {
            throw new ApiError(200).json(200, {}, "No video found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, video, "Video fetched Successfully"));
    } catch (error) {
        throw new ApiError(500, error, "Error getting videos");
    }
});
export const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        if (!isValidObjectId(id)) {
            console.error("here : ", id);
            throw new ApiError(400, "Invalid video id");
        }
        const video = await Video.findById(id).populate(
            "owner",
            "username fullname avatar"
        );
        if (!video) {
            throw new ApiError(404).json(404, {}, "Video not found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, video, "Video fetched Successfully"));
    } catch (error) {
        throw new ApiError(500, error, "Error getting video");
    }
});

export const incrementViewCount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById({ _id: id });
    if (!video) {
        throw new ApiError(404).json(404, {}, "Video not found");
    }
    video.viewCount++;
    await video.save();
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "View Count updated Successfully"));
});
// TODO: Implement getRelatedVideos with advance features

// Documentation
/*
 *const {id} = req.params;: This line extracts the id parameter from the request URL. This id is used to find the original video.
 *const video = await Video.findById(id);: This line finds the original video by its id using the Video model.
 *if (!video) { throw new ApiError(404, "Video not found"); }: This line checks if the original video is found. If not, it throws a 404 error.
 *const relatedVideos = await Video.find({ ... });: This line finds related videos using the Video model. The query object is defined as:
 *_id: { $ne: id }: This ensures that the related videos do not include the original video (by excluding its id).
 *owner: video.owner: This filters videos that have the same owner (creator) as the original video.
 *.limit(10): This limits the number of related videos to 10.
 *.populate('owner', 'username fullname avatar'): This populates the owner field of each related video with the username, fullname, and avatar fields.
 *return res.status(200).json(new ApiResponse(200, relatedVideos, "Related videos fetched successfully"));: This returns a successful response with the related videos.
 */
export const getRelatedVideos = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const relatedVideos = await Video.find({
        _id: { $ne: id },
        owner: video.owner,
    })
        .limit(10)
        .populate("owner", "username fullname avatar");
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                relatedVideos,
                "Related videos fetched successfully"
            )
        );
});
/**
 * Retrieves search results for videos based on a query string.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const getSearchResult = asyncHandler(async (req, res) => {
    // Extract the query string from the request query parameters.
    const { query } = req.query; // this will fetch the query
    if(!query){
        return [];
    }
    try {
        // Find videos that match the query string in the title field.
        const videos = await Video.find({
            title: { $regex: query, $options: "i" },
        }).populate("owner", "username fullname avatar");

        if (!videos || videos.length === 0) {
            throw new ApiError(200, {}, "No videos found");
        }

        // Return a successful response with the search results.
        return res
            .status(200)
            .json(new ApiResponse(200, videos, "Search results fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error, "Error searching videos");
    }
});

export const getSubscribedVideos = asyncHandler(async(req, res) => {
    

    const userId = req.user._id;
    const subscribedChannels = await Subscription.find({subscriber: userId}).select('channel').exec();
    const channelIds = subscribedChannels.map(sub => sub.channel);
    const videos = await Video.find({owner: {$in: channelIds}}).populate('owner', 'username fullname avatar');
    return res.status(200).json(new ApiResponse(200, videos, "Subscribed videos fetched successfully"))
})
import asyncHandler from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";

export const getVideoComments = asyncHandler(async (req, res) => {
    const { videoID } = req.params;

    // /api/videosID?page=2&limit=20
    let { page = 1, limit = 10 } = req.query; //by default page 1 and limit 10 comments per page
    page = parseInt(page);
    limit = parseInt(limit);

    //validation
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    if (isNaN(limit) || limit < 1 || limit > 50) {
        limit = 10; //why this
    }
    const comments = await Comment.find({ videoID: videoID })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("owner", "username avatar");

    const numberOfComments = await Comment.countDocuments({ videoID: videoID });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { comments, numberOfComments },
                "Comments Fetched successfully"
            )
        );
});

export const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { comment } = req.body;
    const userID = req.user?._id;

    if (!userID) {
        throw new ApiError(401, "User not authenticated");
    }
    if (isValidObjectId(videoId)) {
        throw new ApiError(400, "Not a valid VideoID");
    }
    const newComment = await Comment.create({
        comment: content,
        videoId: videoId,
        userID: userID,
    });
    if (!newComment) {
        throw new ApiError(500, "Failed to add comment");
    }
    return res
        .status(201)
        .json(new ApiResponse(201, newComment, "Comment added successfully"));
});

export const deleteComment = asyncHandler(async (req) => {
    const { commentId } = req.params;
    const userID = req.user._id;

    //validations
    if (isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid VideoID");
    }
    if (!userID) {
        throw new ApiError(401, "User Not Authenticated");
    }
    const comment = await Comment.find({
        _id: commentId,
        userID: userID,
    });
    if (!comment) {
        throw new ApiError(
            400,
            "Comment not Found or You are not authorized to delete this"
        );
    }
    comment.deleteOne({ _id: commentId });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted Successfully"));
});

export const updateComment = asyncHandler(async (req, res) => {
    const { commentId, content } = req.params;
    const userId = req.user._id;

    //validations
    if (isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid CommentID");
    }
    if (!userId) {
        new ApiError(401, "User Not authenticated");
    }
    const comment = await Comment.findOne({ _id: commentId, userId: userId });
    4;
    if (!comment) {
        new ApiError(400, "Comment not Found");
    }
    comment.comment = content;
    const updateComment = await comment.save();
    return res
        .status(200)
        .json(200, updateComment, "Comment updated successfully");
});

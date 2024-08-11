import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
export const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const userId = req.user._id; //this we will get from auth middleware
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    //check if the user has already Liked
    const alreadyLiked = await Like.findOne({
        likedBy: userId,
        videoId: videoId,
    });
    //check if the user has already Disliked
    const alreadyDisliked = await Like.findById({
        dislikedBy: userId,
        videoId: videoId,
    });

    if (alreadyLiked) {
        //now we know user has already like to he pressed like to remove his like
        await alreadyDisliked.deleteOne();
        video.likes = video.likes > 0 ? video.likes - 1 : 0; //to avoid making them -ve
    } else {
        //user have not yet liked the video
        if (alreadyDisliked) {
            // remove dislike if it already exist (if a person likes a video and in past he has disliked a video)
            await alreadyDisliked.deleteOne();
            video.dislikes = video.dislikes > 0 ? video.dislikes - 1 : 0;
        }
        await Like.create({ videoId: videoId, userId: userId }); // creating new like document in likes collection
        video.likes += 1; //adding likes to video as well
    }

    //save video document
    await video.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { video },
                "Video like status toggled successfully"
            )
        );
});
export const toggleVideoDislike= asyncHandler(async(req,res)=>{
    const videoId= req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }
    const userId= req.user?._id;
    if(!userId){
        throw new ApiError(401, "User not authenticated"); 
    }
    const video= await Video.findOne({videoId:videoId,userId:userId});
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    //check if the user has already Disliked
    const alreadyDisliked = await Like.findOne({
        dislikedBy: userId,
        videoId: videoId,
    });
    //check if the user has already Liked
    const alreadyLiked = await Like.findOne({
        likedBy: userId,
        videoId: videoId,
    });
    if(alreadyDisliked){
        //now we know user has already disliked to he pressed dislike to remove his dislike
        await alreadyLiked.deleteOne();
        video.dislikes= video.dislikes>0? video.dislikes-1:0; //to avoid making them -ve
    }else{
        if(alreadyLiked){
            //if a person has liked that video and now he is disliking it it for that remove the like
            await alreadyLiked.deleteOne();
            video.likes=video.likes>0? video.likes-1:0;
        }
        await Like.create({videoId: videoId, dislikedBy: userId}); // creating new dislike document in likes collection
        video.dislikes+=1; //adding dislikes to video as well
    }
    //save video document
    await video.save();
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {video},
            "Video dislike status toggled successfully"
        )
    );
    //Documentation
    /*
    
    */

})


export const getLikesByVideoId = async (req, res) => {
    // Implement the getLikesByVideoId function
};

export const getLikesByCommentId = async (req, res) => {
    // Implement the getLikesByCommentId function
};

export const deleteLike = async (req, res) => {
    // Implement the deleteLike function
};

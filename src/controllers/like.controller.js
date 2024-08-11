import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";

export const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if the user has already liked the video
    const existingLike = await Like.findOne({
        likedBy: userId,
        video: videoId,
    });

    // Check if the user has disliked the video
    const existingDislike = await Like.findOne({
        dislikedBy: userId,
        video: videoId,
    });

    if (existingLike) {
        // User has already liked the video, so we need to remove the like
        await existingLike.deleteOne();
        video.likes = video.likes > 0 ? video.likes - 1 : 0;
    } else {
        // User has not liked the video yet
        if (existingDislike) {
            // Remove the dislike if it exists
            await existingDislike.deleteOne();
            video.dislikes = video.dislikes > 0 ? video.dislikes - 1 : 0;
        }

        // Add the new like
        await Like.create({ video: videoId, likedBy: userId });
        video.likes += 1;
    }

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
/*

 * ### `toggleVideoLike` Function Documentation (Hinglish)

#### Overview:
`toggleVideoLike` function ka kaam hai user ke video par like ko toggle karna.
 Matlab agar user ne pehle video ko like kiya hai, toh like ko remove karega, 
 aur agar nahi kiya hai, toh like karega. Saath hi, agar user ne video ko 
 dislike kiya hai, aur ab like kar raha hai, toh dislike bhi remove kar dega. 

#### Code Breakdown:

1. **Video ID Validation:**
   ```javascript
   const { videoId } = req.params;
   if (!isValidObjectId(videoId)) {
       throw new ApiError(400, "Invalid video ID");
   }
   ```
   - Yahan `videoId` ko URL se extract kiya gaya hai.
   - Pehle step mein check hota hai ki `videoId` valid format mein hai ya nahi using
    `isValidObjectId`. Agar invalid hota hai, toh 400 error code ke saath "Invalid video ID" 
    message return hota hai. Is check ka reason ye hai ki sirf valid ObjectId ke saath hi
     database queries successful hoti hain.

2. **User Authentication Check:**
   ```javascript
   const userId = req.user?._id;
   if (!userId) {
       throw new ApiError(401, "User not authenticated");
   }
   ```
   - `userId` ko request se extract kiya ja raha hai, jo authentication middleware set karta hai.
   - Agar `userId` available nahi hai, toh iska matlab user authenticated nahi hai, 
   isliye 401 error throw hota hai. Ye step ensure karta hai ki sirf logged-in users 
   hi like/dislike kar sakein.

3. **Fetch Video from Database:**
   ```javascript
   const video = await Video.findById(videoId);
   if (!video) {
       throw new ApiError(404, "Video not found");
   }
   ```
   - `videoId` se related video ko database se fetch kiya ja raha hai.
   - Agar video nahi milti, toh 404 error throw hota hai, jiska matlab hai
    ki video exist nahi karti ya phir galat `videoId` diya gaya hai. 

4. **Check Existing Like and Dislike:**
   ```javascript
   const existingLike = await Like.findOne({ likedBy: userId, video: videoId });
   const existingDislike = await Like.findOne({ dislikedBy: userId, video: videoId });
   ```
   - Pehle check hota hai ki user ne video ko already like kiya hai ya nahi using `Like.findOne`.
   - Saath hi, ye bhi check hota hai ki user ne video ko dislike kiya hai ya nahi.
    Ye steps isliye important hain taaki ye pata lag sake ki user ka current status kya hai 
    (liked/disliked).

5. **Toggle Logic:**
   ```javascript
   if (existingLike) {
       await existingLike.deleteOne();
       video.likes = video.likes > 0 ? video.likes - 1 : 0;
   } else {
       if (existingDislike) {
           await existingDislike.deleteOne();
           video.dislikes = video.dislikes > 0 ? video.dislikes - 1 : 0;
       }
       await Like.create({ video: videoId, likedBy: userId });
       video.likes += 1;
   }
   ```
   - **Already Liked:**
     - Agar `existingLike` present hai, toh iska matlab user ne pehle hi like kiya hai. Is case mein,
      like ko remove kar diya jata hai (`deleteOne()`) aur video ke likes count ko decrease kar dete hain.
       Negative likes ko avoid karne ke liye minimum 0 par set karte hain.
   - **Not Liked Yet:**
     - Agar `existingLike` present nahi hai, toh pehle check hota hai ki `existingDislike`
      present hai ya nahi. Agar present hai, toh dislike ko remove kar diya jata hai aur dislikes count
       ko decrease kar dete hain.
     - Phir ek new like create hota hai using `Like.create()` aur video ke likes count ko
      increase kar dete hain.

6. **Save Video and Send Response:**
   ```javascript
   await video.save();
   return res.status(200).json(new ApiResponse(200, { video }, 
   "Video like status toggled successfully"));
   ```
   - Video document ko save kiya jata hai database mein taaki updated likes/dislikes 
   count persist ho jaye.
   - Success response ke through updated video details client ko bheje jaate hain
   , jisme message hota hai "Video like status toggled successfully".

### Summary:
Ye function user ke video like/dislike interactions ko efficiently handle karta hai. Har step me validation aur checks hain taaki data consistent rahe aur unnecessary errors avoid kiye jaa sakein. Ye approach isliye liya gaya hai taaki user ke experience ko smooth banaya ja sake aur backend par load minimize ho.
 */

export const toggleVideoDislike = asyncHandler(async (req, res) => {
    const videoId = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }
    const video = await Video.findOne({ videoId: videoId, userId: userId });
    if (!video) {
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
    if (alreadyDisliked) {
        //now we know user has already disliked to he pressed dislike to remove his dislike
        await alreadyLiked.deleteOne();
        video.dislikes = video.dislikes > 0 ? video.dislikes - 1 : 0; //to avoid making them -ve
    } else {
        if (alreadyLiked) {
            //if a person has liked that video and now he is disliking it it for that remove the like
            await alreadyLiked.deleteOne();
            video.likes = video.likes > 0 ? video.likes - 1 : 0;
        }
        await Like.create({ videoId: videoId, dislikedBy: userId }); // creating new dislike document in likes collection
        video.dislikes += 1; //adding dislikes to video as well
    }
    //save video document
    await video.save();
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { video },
                "Video dislike status toggled successfully"
            )
        );
    //Documentation
    /*
    
    */
});

export const getLikedVideo=asyncHandler(async (req,res)=>{
    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(401,"User not authenticated");
    }

    const likedVideo= await Like.find({likedBy:userId})
    .populate({
        path:"video",
        select:"title description url likes dislikes views createdAt owner duration length",
        populate:{
            path:"owner",
            select:"username avatar fullname",
        }
    })
    .exec();

    return res.status(200).json(new ApiResponse(200, likedVideo,"Liked video fetched Successfully"))

});

export const getDislikedVideo=asyncHandler(async(req,res)=>{
    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(401,"User not authenticated");
    }
    const dislikedVideo=await Like.find({dislikedBy:userId})
    .populate({
        path:"video",
        select:"title description url likes dislikes views createdAt owner duration length",
        populate:{
            path:"owner",
            select:"username avatar fullname",
        }
    })
    .exec();
    return res.status(200).json(new ApiResponse(200, dislikedVideo,"Disliked video fetched Successfully"))
});
export const toggleCommentLikes=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment ID");
    }
    const userId= req.user?._id;
    if(!userId){
        throw new ApiError(401,"User not authenticated");
    }
    const like= await Like.find({likedBy:userId,Comment:commentId});

    if(like){
        await Like.findByIdAndDelete(like[0]._id);
        return res.status(200).json(new ApiResponse(200, {},"Like removed successfully"));
    }
    const likedComment=await like.create({
        commentId,
        likedBy:userId,
    });

    return res.status(200).json(new ApiResponse(200,likedComment,"Comment liked successfully"));
})

export const deleteLike = async (req, res) => {
    // Implement the deleteLike function
};

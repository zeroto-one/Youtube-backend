import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        videoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true,
            //unique: true,
        },
        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            required: false,
            default: null,
        },
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        dislikedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const Like = mongoose.model("Like", likeSchema);

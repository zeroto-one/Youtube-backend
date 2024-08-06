import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        videoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        comment: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Comment = mongoose.model("Comment", commentSchema);

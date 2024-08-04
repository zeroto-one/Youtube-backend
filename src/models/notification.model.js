import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        // receiver
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        videoId: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        sender: {
            type: String, // send user avatar url
        },
    },
    { timestamps: true }
);

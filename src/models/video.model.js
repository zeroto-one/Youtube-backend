import mongoose from "mongoose";

 const videoSchema = new mongoose.Schema(
  {
    videoId:{
        type:String,//cloudnary wali id
        required:true,
        
    },
    thumbnailId:{
        type:String,//cloudnary wali id
        required:true,

    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },duration:{
        type:Number,//cloudnairy bejega 
        required:true,
    },viewCount:{
        type:Number,
        default:0,
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    }, 
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
  },
  { timestamps: true }
);
export const Video=mongoose.model("Video",videoSchema);

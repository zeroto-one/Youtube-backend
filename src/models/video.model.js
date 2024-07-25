import mongoose from "mongoose";

 const videoSchema = new mongoose.Schema(
  {
    videoFile:{
        type:String,//cloudnary wali id
        required:true,
        
    },
    thumbnail:{
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
    },views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }
  },
  { timestamps: true }
);
export const Video=mongoose.model("Video",videoSchema);

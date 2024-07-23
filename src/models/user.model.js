import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, //*why this ...it will improve .Frequent Access:hen to make is index true
      //*Improved Query Performance:
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, //leading and end wale blank scapes ko ignore kr deta hen
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //this is cloudinary wala link remember swiggy wala json
      default: "default.jpg", //**remember to add an default image */
      required: true,
    },
    coverImage: {
      type: String, //this is cloudinary wala link remember swiggy wala json
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true,"Password is required"],


    },
    refreshToken:{
        type: String,
        //required: true,
        //select: false, //**remember to hide this field when it is not required or when we are not using it */
      },

  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
